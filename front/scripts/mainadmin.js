


document.addEventListener("DOMContentLoaded", function () {

    const customButtons = document.getElementsByClassName('custom-button');
    const savedClass = localStorage.getItem('savedClass')
    const category = localStorage.getItem('category')
    for (let index = 0; index < customButtons.length; index++) {
        const element = customButtons[index];
        element.addEventListener('click', function () {
            let classButtons = document.getElementsByClassName('custom-button')
            for (let index = 0; index < classButtons.length; index++) {
                const element = classButtons[index];
                element.classList.remove('active')
            }
            localStorage.removeItem('savedClass')
            if (element.classList.contains('active')) {
                element.classList.remove('active')
                localStorage.removeItem('savedClass')
                localStorage.removeItem('category')
            } else {
                element.classList.add('active')
                const categoryText = element.parentElement.parentElement.children[0].textContent
                localStorage.setItem('savedClass', element.textContent)
                localStorage.setItem('category', categoryText)
            }
        })
        const categoryText = element.parentElement.parentElement.children[0].textContent
        if (element.textContent == savedClass && categoryText == category) {
            element.classList.add('active')
            localStorage.setItem('savedClass', element.textContent)
            localStorage.setItem('category', categoryText)
        }

    }
});

