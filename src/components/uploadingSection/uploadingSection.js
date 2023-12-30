export function activeLoading(progress) {
    let uploadingSection = document.getElementById("uploadingSection")
    let uploadingSectionBar = document.getElementById("uploadingSectionBar")
    if (progress == 0) {
        uploadingSectionBar.style.width = `${progress}%`
        uploadingSection.style.display = "flex"
        setTimeout(() => {
            uploadingSection.style.opacity = "1"
        }, 1);
    }
    if (progress > 0 && progress < 100) {
        uploadingSectionBar.style.width = `${progress}%`
    }
    if (progress == 100) {
        uploadingSectionBar.style.width = `${progress}%`
        setTimeout(() => {
            uploadingSection.style.opacity = "0"
            setTimeout(() => {
                uploadingSection.style.display = "none"
            }, 500);
        }, 500);

    }
}