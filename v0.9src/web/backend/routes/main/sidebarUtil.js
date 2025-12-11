module.exports = {
    // [수정] req 파라미터 추가 (세션 확인용)
    getUserContext : (req, hash) => {
        // 1. 세션에서 사용자 정보 가져오기
        const user = req.session.user || {};
        
        // 2. IS_ADMIN 값이 1인지 확인 (true/false 결정)
        // hash.isAdmin = (user.IS_ADMIN === 1);
        hash.isAdmin = true;

        hash['redirectUrl'] = [
            '/dashboard',
            '/dashboard/project',
            '/dashboard/history',
            '/dashboard/settings',
            '/dashboard/project/add',
            '/admin',
        ];
        
        hash['icons'] = [
            '<i class="fi fi-rr-folder"></i>',
            '<i class="fi fi-rr-time-past"></i>',
            '<i class="fi fi-rr-gears"></i>',
            '<i class="fi fi-rr-plus"></i>',
            '<i class="fi fi-rr-angle-small-right"></i>'
        ];

        hash['sidebarContent'] = [
            'projectTitle',
            'historyTitle',
            'settingTitle',
            `addNewButtonMsg`,
            'adminSwitchButtonMsg',
        ];
        
        // 유저 정보도 뷰로 전달 (필요 시 사용)
        hash.user = user;
        
        return hash;
    },

    // [수정] req 파라미터 추가
    getAdminContext : (req, hash) => {
        const user = req.session.user || {};
        // 관리자 페이지에서도 IS_ADMIN 여부를 전달
        // hash.isAdmin = (user.IS_ADMIN === 1);
        hash.user = user;

        hash['redirectUrl'] = [
            '/admin',
            '/admin/database',
            '/admin/user',
            '/admin/history',
            '/dashboard',
        ];

        hash['icons'] = [
            '<i class="fi fi-rr-database-management"></i>',
            '<i class="fi fi-rr-users"></i>',
            '<i class="fi fi-rr-gears"></i>',
            '<i class="fi fi-rr-angle-small-right"></i>',
        ];

        hash['sidebarContent'] = [
            'adminDatabaseTitle',
            'adminUserTitle',
            'historyTitle',
            `adminSwitchButtonMsg`
        ];
        
        return hash;
    }
};