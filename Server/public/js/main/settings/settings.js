const categories = document.querySelectorAll('.settings .categories .category');
categories.forEach(category => {
    category.addEventListener('click', function () {
        categories.forEach(cat => {
            cat.classList.remove('active');
        });
        this.classList.add('active');
    });
});