const dropZone = document.querySelector(".drop-zone");
const browseButton = document.querySelector(".browse-btn");
const fileInput = document.querySelector(".choose-file");
const host = "https://inshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const progressContainer = document.querySelector(".progress-container");
const fileURL = document.querySelector("#fileURL");
const sharingConatiner = document.querySelector(".sharing-container");
const copyButton = document.querySelector(".copy-button");
const emailForm = document.querySelector(".email-form");
const emailURL = `${host}api/files/send`;
const toast = document.querySelector(".toast");
const maxSizeAllowed = 100 * 1024 * 1024; //100mb

browseButton.addEventListener("click", () => {
  fileInput.click();
});

// Drag and Drop Animation ||

dropZone.addEventListener("dragover", e => {
  e.preventDefault();

  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

// For Copy button

copyButton.addEventListener("click", () => {
  fileURL.select();
  document.execCommand("copy");
  showToast("Linked Copied");
});

// Animation Stops when file is Dropped

dropZone.addEventListener("drop", e => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log(files);
  if (files.length) {
    fileInput.files = files;
    uploadFile();
  }
});

fileInput.addEventListener("change", () => {
  uploadFile();
});

const uploadFile = () => {
  // Show Uploading Emotion and Upload Js

  // Check File Length or How many Files Can be Uploaded
  if (fileInput.files.length > 1) {
    resetFileInput();
    showToast("Only Upload 1 File");

    return;
  }

  // Check File Size

  const file = fileInput.files[0];
  if (file.size > maxSizeAllowed) {
    showToast("You Cant Upload More Than 100mb");
    resetFileInput();
    return;
  }

  progressContainer.style.display = "block";

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("myfile", file);
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    //  Displays State
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.response);
      onUploadSucess(JSON.parse(xhr.response));
    }
  };

  // Upload Progress

  xhr.upload.onprogress = updateProgress();

  xhr.upload.onerror = () => {
    resetFileInput();
    showToast(`Error in upload: ${xhr.statusText}`);
  };

  xhr.open("POST", uploadURL);
  xhr.send(formData);
};

const updateProgress = e => {
  const percent = Math.round((e.loaded / e.total) * 100);
  console.log(percent);

  // Loading Animation

  bgProgress.style.width = `${percent}%`;
  percentDiv.innerText = percent;
  progressBar.style.transform = `scaleX(${percent / 100})`;
};

// Shows Link

const onUploadSucess = ({ file: url }) => {
  console.log(url);
  // Empty the file after submitting the File
  resetFileInput();
  emailForm[2].removeAttribute("disabled");
  // Hide Upload Window after uploading file
  progressContainer.style.display = "none";
  sharingConatiner.style.display = "block";
  fileURL.value = url;
};

// const for resetFileInput ;

const resetFileInput = () => {
  fileInput.value = "";
};

// Submit Form Button

emailForm.addEventListener("submit", e => {
  e.preventDefault();
  console.log("submitted");
  const url = fileInput.value;

  const formData = {
    uuid: url.split("/").splice(-1, 2)[0],
    emailInfo: emailForm.elements["to-email"].value,
    emailFrom: emailForm.elements["from-email"].value
  };

  emailForm[2].setAttribute("disable", "true"); //Disable button after submitting email

  console.log(formData);

  // Email Handling and putting in Server

  fetch(emailURL, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(formData)
  })
    .then(res => res.json())
    .then(({ success }) => {
      console.log(success);

      if (success) {
        sharingConatiner.style.display = "none";
        showToast("Email Send");
      }
    });
});

// Show Copied animation

let toastTimer;

const showToast = msg => {
  toast.innerText = msg;
  toast.style.transform = "translateY(-50%,0)";
  clearTimeout(toastTimer);

  // Hide Toast

  toastTimer = setTimeout(() => {
    toast.style.transform = "translate(-50%,60px)";
  }, 2000);
};
