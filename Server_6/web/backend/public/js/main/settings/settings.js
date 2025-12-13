// 카테고리 클릭 시 활성화 클래스 토글 스크립트

const categories = document.querySelectorAll('.settings .categories .category');
categories.forEach(category => {
    category.addEventListener('click', function () {
        categories.forEach(cat => {
            cat.classList.remove('active');
        });
        this.classList.add('active');
    });
});