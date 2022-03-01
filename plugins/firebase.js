// Firebase 9: https://lupas.medium.com/firebase-9-beta-nuxt-js-981cf3dac910

// v9: 'firebase/app' -> 'firebase/compat/app'
import { initializeApp, getApps } from "firebase/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
import path from "path";

// https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyBtJ2EN7_JznLs03fYngKzl0nN6F9-5G9I",
  authDomain: "vuetest-103b3.firebaseapp.com",
  projectId: "vuetest-103b3",
  storageBucket: "vuetest-103b3.appspot.com",
  messagingSenderId: "640887077281",
  appId: "1:640887077281:web:a87322542e2246c1f2f3e0",
};
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
// const db = getFirestore();
const storage = getStorage();
const storageRef = ref(storage);

// async https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function
// async 関数において、返値に関しては暗黙的に `Promise.resolve(/* value */)` でラップされる
// https://qiita.com/sotszk/items/f23199e864cba47455ce
// `Promise.resolve(/* value */)` は以下と等価
// `new Promise(resolve => resolve(/* value */))`
async function getUrl(devName, suffix) {
  return getDownloadURL(ref(storage, path.join(devName, devName + suffix)));
}
async function getJsonData(devName, suffix) {
  return getUrl(devName, suffix).then((url) =>
    fetch(url).then((res) => res.json())
  );
}

// export default ({ app }, inject) => {
//   let slides = [];
//   listAll(storageRef).then((res) => {
//     if (process.server) {
//       console.log("(dbg) SSR");
//       return;
//     }
//     console.log("(dbg) CSR");

//     const developerNames = res.prefixes.map((dirRef) => dirRef.name);
//     developerNames.forEach((devName) => {
//       Promise.all([
//         getUrl(devName, "_thumbnail"),
//         getJsonData(devName, "_.data.json"),
//       ]).then((resolves) => {
//         const [tmbUrl, jsonData] = resolves;
//         slides.push({
//           tmbUrl,
//           genre: jsonData.tags,
//           title: jsonData.title,
//           caption: jsonData.caption.replace(/\n/g, "<br>"),
//         });
//       });
//     });
//   });
//   inject("slides", slides);
// };

// https://stackoverflow.com/questions/56638966/vue-js-using-local-javascript-file-functions-in-component-uncaught-typeerror
// https://codelikes.com/nuxt-plugin/
const getSlides = async (genre) => {
  let slides = [];
  listAll(storageRef).then((res) => {
    if (process.server) {
      console.log("(dbg) SSR");
      return;
    }
    console.log("(dbg) CSR");

    const developerNames = res.prefixes.map((dirRef) => dirRef.name);
    developerNames.forEach((devName) => {
      Promise.all([
        getUrl(devName, "_thumbnail"),
        getJsonData(devName, "_.data.json"),
      ]).then((resolves) => {
        const [localTmbUrl, jsonData] = resolves;
        if (jsonData.tags == genre) {
          slides.push({
            tmbUrl: localTmbUrl,
            title: jsonData.title,
            caption: jsonData.caption.replace("\n", "<br>"),
          });
        }
      });
    });
  });
  return slides;
};
export default (context, inject) => {
  inject("getSlides", getSlides);
};