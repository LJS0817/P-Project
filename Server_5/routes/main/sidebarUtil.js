module.exports = {
    getUserContext : (hash) => {
        hash.isAdmin = true;
        hash['redirectUrl'] = [
            '/dashboard',
            '/dashboard/project',
            '/dashboard/history',
            '/dashboard/settings',
        ]
        hash['icons'] = [
            '<i class="fi fi-rr-folder"></i>',
            '<i class="fi fi-rr-time-past"></i>',
            '<i class="fi fi-rr-gears"></i>',
        ]
        hash['sidebarContent'] = [
            'Projects',
            'History',
            'Settings',
            `<a href="/dashboard/project/add" class="addProjectBtn">
                Add<br>project
                <div class="addSphere"><i class="fi fi-rr-plus"></i></div>
            </a>
            ${hash.isAdmin ? '<a href="/admin" class="addProjectBtn" style="margin-top:1em"> Switch<br>user mode <div class="addSphere"><i class="fi fi-rr-angle-small-right"></i></div> </a>' : ''}`
        ]
        return hash;
    },
    getAdminContext : (hash) => {
        hash['redirectUrl'] = [
            '/admin',
            '/admin/database',
            '/admin/user',
            '/admin/history',
        ]
        hash['icons'] = [
            '<i class="fi fi-rr-database-management"></i>',
            '<i class="fi fi-rr-users"></i>',
            '<i class="fi fi-rr-gears"></i>'
        ]
        hash['sidebarContent'] = [
            'Database',
            'Users',
            'Histories',
            `<a href="/dashboard" class="addProjectBtn">
                Switch<br>user mode
                <div class="addSphere"><i class="fi fi-rr-angle-small-right"></i></div>
            </a>`
        ]
        return hash;
    }
};