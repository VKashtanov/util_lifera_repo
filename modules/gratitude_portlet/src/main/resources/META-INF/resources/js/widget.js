(function () {
    'use strict';

    // ==================== LIFERAY SPA INTEGRATION ====================
    let widgetInstance = null;


    function waitForElements(selectors, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            function checkElements() {
                const elements = selectors.map(selector => document.querySelector(selector));
                const allFound = elements.every(element => element !== null);

                if (allFound) {
                    resolve(elements);
                    return;
                }

                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Elements not found within ${timeout}ms: ${selectors.join(', ')}`));
                    return;
                }

                setTimeout(checkElements, 100);
            }

            checkElements();
        });
    }


    async function initializeGratitudeWidget() {


        const gratitudesList = document.getElementById('gratitudesList');
        if (!gratitudesList) {
            return;
        }


        if (window.gratitudeWidgetInstance &&
            window.gratitudeWidgetInstance._initialized &&
            window.gratitudeWidgetInstance.container === gratitudesList) {
            window.gratitudeWidgetInstance.refreshAllData();
            return;
        }

        try {
            await waitForElements([
                '#gratitudesList',
                '#sendGratitudeBtn',
                '#searchInput',
                '#gratitudeComment',
                '#gratitudeModal'
            ]);


            if (window.gratitudeWidgetInstance) {
                window.gratitudeWidgetInstance.destroy();
                window.gratitudeWidgetInstance = null;
            }


            await new Promise(resolve => setTimeout(resolve, 100));

            widgetInstance = new GratitudeMainWidget();

        } catch (error) {
            if (window.gratitudeWidgetInstance) {
                window.gratitudeWidgetInstance.destroy();
                window.gratitudeWidgetInstance = null;
            }
            setTimeout(initializeGratitudeWidget, 1000);
        }
    }

    class GratitudeMainWidget {
        constructor() {


            if (window.gratitudeWidgetInstance && window.gratitudeWidgetInstance._initialized) {
                return window.gratitudeWidgetInstance;
            }


            if (window.gratitudeWidgetInstance) {
                window.gratitudeWidgetInstance.destroy();
                window.gratitudeWidgetInstance = null;
            }


            this.container = document.getElementById('gratitudesList');
            this.boundHandlers = null;

            this.resetState();


            this.initializeDOMElements();

            this.init();


            window.gratitudeWidgetInstance = this;
        }


        resetState() {

            this.controller = null;
            this.timeoutId = null;
            this.selectedUsers = [];
            this.lastSearchResults = [];
            this.generalDirectorId = null;
            this.currentGratitudeData = null;
            this.formWasSubmitted = false;


            this.currentGratitudePage = 1;
            this.totalPages = 1;
            this.pageSize = 5;
            this.totalGratitudes = 0;
            this.isLoadingGratitudes = false;


            this._initialized = false;
        }


        initializeDOMElements() {
            this.sendButton = document.getElementById('sendGratitudeBtn');
            this.searchInput = document.getElementById('searchInput');
            this.commentTextarea = document.getElementById('gratitudeComment');
            this.searchResults = document.getElementById('searchResults');
            this.searchInfo = document.getElementById('searchInfo');
            this.searchInputWrapper = document.getElementById('searchInputWrapper');
            this.gratitudesFilters = document.getElementById('gratitudesFilters');
            this.topThankedList = document.getElementById('topThankedList');
            this.topThankersList = document.getElementById('topThankersList');
            this.pagination = document.getElementById('pagination');


            this.modal = document.getElementById('gratitudeModal');
            this.modalAuthorAvatar = document.getElementById('modalAuthorAvatar');
            this.modalAuthorInitials = document.getElementById('modalAuthorInitials');
            this.modalAuthorName = document.getElementById('modalAuthorName');
            this.modalDate = document.getElementById('modalDate');
            this.modalAuthorPosition = document.getElementById('modalAuthorPosition');
            this.modalGratitudeText = document.getElementById('modalGratitudeText');
            this.modalRecipientsList = document.getElementById('modalRecipientsList');
            this.modalLikeBtn = document.getElementById('modalLikeBtn');
            this.modalLikeCount = document.getElementById('modalLikeCount');
            this.modalCloseBtn = document.getElementById('modalCloseBtn');


            this.userSearchContainer = document.getElementById('userSearchContainer');
            this.userSearchError = document.getElementById('userSearchError');
            this.commentContainer = document.getElementById('commentContainer');
            this.commentError = document.getElementById('commentError');
        }


        forceRerender() {
            if (this.container) {

                const currentPage = this.currentGratitudePage;
                const currentFilter = this.gratitudesFilters ?
                    this.gratitudesFilters.querySelector('input[name="type"]:checked').value : 'all';


                this.container.innerHTML = '';
                this.currentGratitudePage = currentPage;
                this.loadGratitudes();

            }
        }

        init() {

            this.loadGeneralDirector();
            this.loadResponsiblePerson();
            this.initializeEventListeners();
            this.createPageSizeSelector();
            this.loadStatistics();
            this.loadGratitudes();
            this.addSectionInfo();

            this.setupFooterObserver();
            this.setupRealTimeValidation();


            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.refreshAllData();
                }
            });

            this._initialized = true;

        }


        initializeEventListeners() {

            this.boundHandlers = {
                handleSearchInput: (e) => this.handleSearchInput(e),
                handleSearchFocus: () => {
                    if (this.lastSearchResults && this.lastSearchResults.length > 0) {
                        this.searchResults.style.display = 'block';
                    }
                },
                handleDocumentClick: (e) => {
                    if (this.searchInputWrapper && !this.searchInputWrapper.contains(e.target) &&
                        this.searchResults && !this.searchResults.contains(e.target)) {
                        this.searchResults.style.display = 'none';
                    }
                },
                handleChipClick: (e) => {
                    if (e.target.classList.contains('remove-user-btn')) {
                        const userId = e.target.getAttribute('data-user-id');
                        this.removeSelectedUser(userId);
                        e.stopPropagation();
                    }
                },
                handleSendGratitude: () => this.sendGratitude(),
                handleFilterChange: () => this.handleFilterChange(),
                handleModalClose: () => this.closeModal(),
                handleModalClick: (e) => {
                    if (e.target === this.modal) {
                        this.closeModal();
                    }
                },
                handleModalLike: () => this.handleModalLikeClick(),
                handleEscapeKey: (e) => {
                    if (e.key === 'Escape' && this.modal && this.modal.classList.contains('gratitude-modal_is-open')) {
                        this.closeModal();
                    }
                },
                handleVisibilityChange: () => {
                    if (!document.hidden) {
                        this.refreshAllData();
                    }
                }
            };

            if (this.searchInput) {
                this.searchInput.addEventListener('input', this.boundHandlers.handleSearchInput);
                this.searchInput.addEventListener('focus', this.boundHandlers.handleSearchFocus);
            }

            document.addEventListener('click', this.boundHandlers.handleDocumentClick);

            if (this.searchInputWrapper) {
                this.searchInputWrapper.addEventListener('click', this.boundHandlers.handleChipClick);
            }

            if (this.sendButton) {
                this.sendButton.addEventListener('click', this.boundHandlers.handleSendGratitude);
            }

            if (this.gratitudesFilters) {
                this.gratitudesFilters.addEventListener('change', this.boundHandlers.handleFilterChange);
            }

            if (this.modalCloseBtn) {
                this.modalCloseBtn.addEventListener('click', this.boundHandlers.handleModalClose);
            }

            if (this.modal) {
                this.modal.addEventListener('click', this.boundHandlers.handleModalClick);
            }

            if (this.modalLikeBtn) {
                this.modalLikeBtn.addEventListener('click', this.boundHandlers.handleModalLike);
            }

            document.addEventListener('keydown', this.boundHandlers.handleEscapeKey);

            document.addEventListener('visibilitychange', this.boundHandlers.handleVisibilityChange);
        }

        // ==================== VALIDATION AND ERROR HANDLING ====================

        validateForm() {
            let isValid = true;

            if (this.selectedUsers.length === 0) {
                this.showError(this.userSearchContainer, this.userSearchError);
                isValid = false;
            } else {
                this.hideError(this.userSearchContainer, this.userSearchError);
            }

            const comment = this.commentTextarea ? this.commentTextarea.value.trim() : '';
            if (comment.length < 100) {
                this.showError(this.commentContainer, this.commentError);
                isValid = false;
            } else {
                this.hideError(this.commentContainer, this.commentError);
            }

            return isValid;
        }

        showError(container, errorElement) {
            if (container) container.classList.add('_error');
            if (errorElement) errorElement.classList.add('_visible');
        }

        hideError(container, errorElement) {
            if (container) container.classList.remove('_error');
            if (errorElement) errorElement.classList.remove('_visible');
        }

        setupRealTimeValidation() {
            this.formWasSubmitted = false;

            if (this.commentTextarea) {
                this.commentTextarea.addEventListener('input', () => {
                    if (this.formWasSubmitted) {
                        this.validateCommentField();
                    }
                });
            }
        }

        validateCommentField() {
            const comment = this.commentTextarea ? this.commentTextarea.value.trim() : '';
            if (comment.length < 100) {
                this.showError(this.commentContainer, this.commentError);
            } else {
                this.hideError(this.commentContainer, this.commentError);
            }
        }

        validateUsersField() {
            if (this.selectedUsers.length === 0) {
                this.showError(this.userSearchContainer, this.userSearchError);
            } else {
                this.hideError(this.userSearchContainer, this.userSearchError);
            }
        }


        isEmail(input) {
            if (!input || typeof input !== 'string') return false;

            const trimmed = input.trim();
            if (trimmed === '') return false;

            if (/[а-яёА-ЯЁ\s,()"'\\\/#;]/.test(trimmed)) {
                return false;
            }

            const allowedEmailChars = /^[a-zA-Z0-9._%+-@]+$/;
            if (!allowedEmailChars.test(trimmed)) {
                return false;
            }

            if (!/[@._+-]/.test(trimmed)) {
                return false;
            }

            return true;
        }

        detectSearchType(query) {
            if (this.isEmail(query)) {
                return 'email';
            } else {
                return 'fio';
            }
        }

        parseFIOQuery(query) {
            const words = query.trim().split(/\s+/).filter(word => word.length > 0);
            const result = {
                lastName: words[0] || '',
                firstName: words[1] || '',
                middleName: words[2] || '',
                mode: this.getFioMode(words.length)
            };
            return result;
        }

        getFioMode(wordCount) {
            const modes = {
                0: 'empty',
                1: 'lastname_only',
                2: 'lastname_firstname',
                3: 'full_name'
            };
            return modes[wordCount] || 'text';
        }

        showSearchType(mode) {
            const typeTexts = {
                'lastname_only': ' Поиск по фамилии',
                'lastname_firstname': 'Поиск по фамилии и имени',
                'full_name': 'Поиск по ФИО',
                'empty': 'Введите данные',
                'text': 'Текстовый поиск',
                'email': ' Поиск по email'
            };
            if (this.searchInfo) {
                this.searchInfo.textContent = typeTexts[mode] || ' Поиск';
                this.searchInfo.className = 'search-info info';
            }
        }

        async handleSearchInput(e) {
            const query = e.target.value.trim();

            if (this.searchResults) {
                this.searchResults.innerHTML = '';
                this.searchResults.style.display = 'none';
            }

            if (this.searchInfo) {
                this.searchInfo.textContent = '';
                this.searchInfo.className = 'search-info';
            }

            if (this.timeoutId) clearTimeout(this.timeoutId);
            if (this.controller) this.controller.abort();

            if (query.length < 2) return;

            const searchType = this.detectSearchType(query);
            let requestBody;

            if (searchType === 'email') {
                requestBody = {
                    query: query,
                    searchType: 'email',
                    companyId: appConfig.companyId,
                    currentUserId: appConfig.currentUserId,
                    siteId: appConfig.siteId
                };
                this.showSearchType('email');
            } else {
                const fioAnalysis = this.parseFIOQuery(query);
                this.showSearchType(fioAnalysis.mode);

                requestBody = {
                    query: query,
                    searchType: 'structured_fio',
                    structured: fioAnalysis,
                    companyId: appConfig.companyId,
                    currentUserId: appConfig.currentUserId,
                    siteId: appConfig.siteId
                };
            }

            this.timeoutId = setTimeout(async () => {
                const url = `${appConfig.springApiUrl}/gratitude/search`;
                this.controller = new AbortController();
                const fetchTimeout = setTimeout(() => this.controller.abort(), 5000);

                try {
                    const res = await fetch(url, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(requestBody),
                        signal: this.controller.signal
                    });

                    clearTimeout(fetchTimeout);
                    this.controller = null;

                    if (!res.ok) throw new Error('Ошибка сервера');

                    const data = await res.json();
                    const filteredData = this.filterAlreadySelectedUsers(data);
                    this.lastSearchResults = filteredData;

                    if (this.searchResults) {
                        if (filteredData.length === 0) {
                            if (data.length > 0) {
                                this.searchResults.innerHTML = '<div class="no-results">Все найденные пользователи уже выбраны или исключены</div>';
                            } else {
                                this.searchResults.innerHTML = '<div class="no-results">Ничего не найдено</div>';
                            }
                        } else {
                            filteredData.forEach(item => {
                                const resultItem = document.createElement('div');
                                resultItem.className = 'search-result-item';
                                const userId = item.userId || item.id;
                                resultItem.setAttribute('data-user-id', userId);

                                resultItem.innerHTML = `
                                    <div class="search-result-content">
                                        <img src="${item.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" 
                                             alt="${item.fullName || 'User'}" 
                                             class="search-result-avatar"
                                             onerror="this.src='${appConfig.contextPath}/image/user_male_portrait'">
                                        <div class="search-result-info">
                                            <div class="result-name">${item.fullName || item.name || 'Unknown'}</div>
                                            ${item.email ? `<div class="result-email">${item.email}</div>` : ''}
                                            ${item.position ? `<div class="result-position">${item.position}</div>` : ''}
                                        </div>
                                    </div>
                                `;
                                resultItem.addEventListener('click', () => {
                                    this.handleSearchResultClick(item);
                                });

                                this.searchResults.appendChild(resultItem);
                            });
                        }

                        this.searchResults.style.display = 'block';
                    }

                } catch (err) {
                    this.controller = null;
                    if (err.name !== 'AbortError') {
                        console.error('Search error:', err);
                        if (this.searchResults) {
                            this.searchResults.innerHTML = '<div class="search-error">Ошибка поиска</div>';
                        }
                        if (this.searchInfo) {
                            this.searchInfo.textContent = 'Произошла ошибка при поиске';
                            this.searchInfo.className = 'search-info error';
                        }
                        if (this.searchResults) {
                            this.searchResults.style.display = 'block';
                        }
                    }
                }
            }, 300);
        }

        filterAlreadySelectedUsers(users) {
            if (!users || !Array.isArray(users)) {
                console.warn('⚠️ filterAlreadySelectedUsers: invalid users array', users);
                return [];
            }

            const filtered = users.filter(user => {
                if (!user) return false;

                const userId = user.userId || user.id;
                if (!userId) return false;

                const isAlreadySelected = this.selectedUsers.some(selected => {
                    if (!selected) return false;
                    const selectedId = selected.userId || selected.id;
                    return selectedId && selectedId == userId;
                });

                const isGeneralDirector = this.generalDirectorId && userId == this.generalDirectorId;
                const isCurrentUser = userId == appConfig.currentUserId;

                const shouldExclude = isAlreadySelected || isGeneralDirector || isCurrentUser;

                if (shouldExclude) {
                }

                return !shouldExclude;
            });


            return filtered;
        }

        handleSearchResultClick(userData) {

            this.addSelectedUser(userData);
            if (this.searchResults) {
                this.searchResults.style.display = 'none';
            }
            if (this.searchInput) {
                this.searchInput.value = '';
            }

            if (this.searchInput) {
                this.searchInput.placeholder = '';
            }

            if (this.searchInfo) {
                this.searchInfo.textContent = '';
                this.searchInfo.className = 'search-info';
            }

            if (this.searchInput) {
                this.searchInput.focus();
            }
        }


        addSelectedUser(user) {
            const userId = user.userId || user.id;

            if (!this.selectedUsers.some(u => (u.userId || u.id) === userId)) {
                const userToAdd = {
                    id: userId,
                    userId: userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    position: user.position,
                    portraitUrl: user.portraitUrl
                };

                this.selectedUsers.push(userToAdd);
                this.renderSelectedUsers();
            }
        }

        removeSelectedUser(userId) {
            this.selectedUsers = this.selectedUsers.filter(user => (user.userId || user.id) != userId);
            this.renderSelectedUsers();

            if (this.selectedUsers.length === 0 && this.searchInput) {
                this.searchInput.placeholder = 'Введите имя или email для поиска коллег...';
            }

            if (this.searchInput && this.searchInput.value.trim().length >= 2) {
                this.searchInput.dispatchEvent(new Event('input'));
            }
        }

        clearAllSelectedUsers() {
            this.selectedUsers = [];
            this.renderSelectedUsers();

            if (this.searchInput) {
                this.searchInput.placeholder = 'Введите имя или email для поиска коллег...';
                this.searchInput.focus();
            }
        }

        renderSelectedUsers() {
            if (!this.searchInputWrapper) return;

            const existingChips = this.searchInputWrapper.querySelectorAll('.selected-user-chip');
            const existingClearBtn = this.searchInputWrapper.querySelector('.clear-all-btn');

            existingChips.forEach(chip => chip.remove());
            if (existingClearBtn) existingClearBtn.remove();

            this.selectedUsers.forEach(user => {
                const userChip = document.createElement('div');
                userChip.className = 'selected-user-chip';
                const userId = user.userId || user.id;

                userChip.innerHTML = `
                    <span class="user-name">${user.fullName || user.name || 'Unknown User'}</span>
                    <button class="remove-user-btn" data-user-id="${userId}" type="button">×</button>
                `;

                this.searchInputWrapper.insertBefore(userChip, this.searchInput);
            });

            if (this.selectedUsers.length > 0) {
                const clearAllBtn = document.createElement('button');
                clearAllBtn.className = 'clear-all-btn';
                clearAllBtn.type = 'button';
                clearAllBtn.innerHTML = '×';
                clearAllBtn.title = 'Очистить всех';
                clearAllBtn.addEventListener('click', () => this.clearAllSelectedUsers());
                this.searchInputWrapper.appendChild(clearAllBtn);
            }

            if (this.selectedUsers.length > 0 && this.searchInput) {
                this.searchInput.placeholder = '';
            }

            if (this.searchInput) {
                this.searchInput.focus();
            }
        }

        highlightActiveUserInStats(userId, filterType) {

            const allStatsItems = document.querySelectorAll('.thanks-stats-user');

            if (allStatsItems.length === 0) {
                return;
            }


            allStatsItems.forEach((item, index) => {
                const itemUserId = item.getAttribute('data-user-id');
                const itemFilter = item.getAttribute('data-filter');
                const hasActiveClass = item.classList.contains('thanks-stats-user_active');
                const itemText = item.querySelector('.thanks-stats-user__name')?.textContent || 'Нет имени';
                item.classList.remove('thanks-stats-user_active');
            });

            if (userId) {
                const userIdStr = userId.toString();
                const selector = `.thanks-stats-user[data-user-id="${userIdStr}"][data-filter="${filterType}"]`;
                const clickedItem = document.querySelector(selector);

                if (clickedItem) {
                    const alreadyActive = clickedItem.classList.contains('thanks-stats-user_active');
                    if (!alreadyActive) {
                        clickedItem.classList.add('thanks-stats-user_active');
                    }
                } else {
                    document.querySelectorAll('.thanks-stats-user').forEach((item, index) => {
                    });

                    const byUserIdOnly = document.querySelectorAll(`.thanks-stats-user[data-user-id="${userIdStr}"]`);
                    const byFilterOnly = document.querySelectorAll(`.thanks-stats-user[data-filter="${filterType}"]`);
                }
            }
        }


        // ==================== ОТПРАВКА БЛАГОДАРНОСТИ ====================
        async sendGratitude() {
            this.formWasSubmitted = true;

            if (!this.validateForm()) {
                return;
            }

            const comment = this.commentTextarea ? this.commentTextarea.value.trim() : '';

            const gratitudeData = {
                recipients: this.selectedUsers.map(user => ({
                    userId: user.userId || user.id,
                    userName: user.fullName || user.name,
                    userEmail: user.email
                })),
                comment: comment,
                siteId: appConfig.siteId,
                companyId: appConfig.companyId,
                senderUserId: appConfig.currentUserId
            };


            try {
                if (this.sendButton) {
                    this.sendButton.disabled = true;
                    this.sendButton.textContent = 'Отправка...';
                }

                const response = await fetch(`${appConfig.springApiUrl}/gratitude/send`, {                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(gratitudeData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ошибка отправки');
                }

                const result = await response.json();

                this.selectedUsers = [];
                this.renderSelectedUsers();
                if (this.commentTextarea) {
                    this.commentTextarea.value = '';
                }
                if (this.searchInput) {
                    this.searchInput.value = '';
                }
                if (this.searchResults) {
                    this.searchResults.innerHTML = '';
                    this.searchResults.style.display = 'none';
                }
                if (this.searchInfo) {
                    this.searchInfo.textContent = '';
                }

                if (this.searchInput) {
                    this.searchInput.placeholder = 'Введите имя или email для поиска коллег...';
                }

                await this.refreshAllData();
            } catch (error) {

                alert('Ошибка отправки благодарности: ' + error.message);
            } finally {
                if (this.sendButton) {
                    this.sendButton.disabled = false;
                    this.sendButton.textContent = 'Отправить благодарность';
                }
            }
        }

        // ==================== ОБНОВЛЕНИЕ ВСЕХ ДАННЫХ ====================

        async refreshAllData() {
            try {
                this.currentGratitudePage = 1;
                this.totalPages = 1;
                if (this.container) {
                    this.container.innerHTML = '<div class="loading-spinner">Обновление данных...</div>';
                }

                await Promise.all([
                    this.loadGratitudes(),
                    this.loadStatistics()
                ]);

            } catch (error) {
                console.error('Error refreshing data:', error);
            }
        }

        // ==================== ЗАГРУЗКА БЛАГОДАРНОСТЕЙ ====================
        async loadGratitudes() {


            if (this.isLoadingGratitudes || !this.container) {
                return;
            }

            this.isLoadingGratitudes = true;

            if (this.pagination) {
                this.pagination.classList.add('pagination_is-loading');
            }

            const currentFilter = this.gratitudesFilters ?
                this.gratitudesFilters.querySelector('input[name="type"]:checked').value : 'all';

            try {
                const requestData = {
                    siteId: appConfig.siteId,
                    page: this.currentGratitudePage,
                    pageSize: this.pageSize,
                    filter: currentFilter,
                    userId: appConfig.currentUserId
                };


                const response = await fetch(`${appConfig.springApiUrl}/gratitude`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    const validGratitudes = data.gratitudes || [];
                    const displayedGratitudes = validGratitudes.slice(0, this.pageSize);

                    if (data.hasMore) {
                        const receivedElementsCount = (this.currentGratitudePage - 1) * this.pageSize + validGratitudes.length;
                        this.totalGratitudes = Math.max(this.totalGratitudes, receivedElementsCount + 1);
                    } else {
                        this.totalGratitudes = Math.max(
                            this.totalGratitudes,
                            (this.currentGratitudePage - 1) * this.pageSize + displayedGratitudes.length
                        );
                    }

                    this.totalPages = Math.ceil(this.totalGratitudes / this.pageSize);

                    if (!data.hasMore && this.currentGratitudePage === this.totalPages) {
                        const actualTotal = (this.currentGratitudePage - 1) * this.pageSize + displayedGratitudes.length;
                        this.totalGratitudes = actualTotal;
                        this.totalPages = Math.ceil(this.totalGratitudes / this.pageSize);
                    }

                    this.container.innerHTML = '';

                    if (displayedGratitudes.length > 0) {
                        this.renderGratitudes(displayedGratitudes);
                    } else {
                        if (this.currentGratitudePage > 1) {
                            this.currentGratitudePage = Math.max(1, this.currentGratitudePage - 1);
                            this.isLoadingGratitudes = false;
                            this.loadGratitudes();
                            return;
                        }
                        this.showEmptyGratitudesState();
                    }
                    this.updatePagination();

                } else {
                    this.showEmptyGratitudesState();
                    this.updatePagination();
                }
            } catch (error) {
                this.showEmptyGratitudesState();
                this.updatePagination();
            } finally {
                this.isLoadingGratitudes = false;
                if (this.pagination) {
                    this.pagination.classList.remove('pagination_is-loading');
                }
            }
        }

        renderGratitudes(gratitudes) {

            if (!this.container) {
                return;
            }
            if (!gratitudes || gratitudes.length === 0) {
                this.showEmptyGratitudesState();
                return;
            }
            gratitudes.forEach((gratitude, index) => {
                const gratitudeElement = this.createGratitudeElement(gratitude);
                this.container.appendChild(gratitudeElement);
            });
        }

        createGratitudeElement(gratitude) {
            const li = document.createElement('li');
            li.className = 'thanks__item thanks-item';
            li.setAttribute('data-article-id', gratitude.articleId);

            const formattedDate = this.formatDate(gratitude.timestamp);
            const likeCount = gratitude.likeQty || 0;
            const avatarColor = this.getAvatarColor(gratitude.author.userId || gratitude.author.id);

            li.innerHTML = `
                <div class="thanks-item__card">
                    ${gratitude.recipients && gratitude.recipients.length > 0 ? `
                        <ul class="thanks-item__avatars">
                            ${gratitude.recipients.map((recipient, index) => {
                const recipientAvatarColor = this.getAvatarColor(recipient.userId || recipient.id);
                return `
                                    <li style="z-index: ${gratitude.recipients.length - index}">
                                        <div class="thanks-item__avatars-item">
                                            <div class="thanks-item__avatars-item-avatar" style="background-color: ${recipientAvatarColor}">
                                                <img class="cover-image" src="${recipient.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" alt="${recipient.fullName}" onerror="this.style.display='none'" />
                                                <span class="thanks-item__avatars-item-name">${this.getInitials(recipient.fullName)}</span>
                                            </div>
                                            <div class="thanks-item__avatars-item-tooltip">
                                                <span class="thanks-item__avatars-item-tooltip-name">${recipient.fullName}</span>
                                                ${recipient.position ? `<span class="thanks-item__avatars-item-tooltip-work">${recipient.position}</span>` : ''}
                                            </div>
                                        </div>
                                    </li>
                                `;
            }).join('')}
                        </ul>
                    ` : ''}
                    <p class="thanks-item__text text">${this.escapeHtml(gratitude.articleText)}</p>
                    <div class="thanks-items__author user-label">
                        <div class="user-label__avatar" style="background-color: ${avatarColor}">
                            <img class="cover-image" src="${gratitude.author.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" alt="${gratitude.author.fullName}" onerror="this.style.display='none'" />
                            <span class="user-label__avatar-name">${this.getInitials(gratitude.author.fullName)}</span>
                        </div>
                        <div class="user-label__about">
                            <p class="user-label__name text">${gratitude.author.fullName}</p>
                            <div class="user-label__description">
                                <span class="user-label__description-item user-label__date">${formattedDate}</span>
                                ${gratitude.author.position ? `<span class="user-label__description-item user-label__work">${gratitude.author.position}</span>` : ''}
                            </div>
                        </div>
                        <button class="thanks-btn user-label__btn text" data-article-id="${gratitude.articleId}">
                            <span class="thanks-btn__text">${likeCount}</span>
                            <svg width="9" height="12" viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 12C2.0145 12 0 10.5 0 7.875C0 6.75 0.375 4.875 1.875 3.375C1.6875 4.5 2.8125 4.875 2.8125 4.875C2.25 3 3.75 0.375 6 0C5.73225 1.5 5.625 3 7.5 4.5C8.4375 5.25 9 6.54675 9 7.875C9 10.5 6.9855 12 4.5 12ZM4.5 11.25C5.74275 11.25 6.75 10.5 6.75 9.1875C6.75 8.625 6.5625 7.6875 5.8125 6.9375C5.90625 7.5 5.25 7.875 5.25 7.875C5.53125 6.9375 4.875 5.4375 3.75 5.25C3.88425 6 3.9375 6.75 3 7.5C2.53125 7.875 2.25 8.523 2.25 9.1875C2.25 10.5 3.25725 11.25 4.5 11.25Z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            const card = li.querySelector('.thanks-item__card');
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.thanks-btn')) {
                    this.openModal(gratitude);
                }
            });

            const likeBtn = li.querySelector('.thanks-btn');
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleLikeClick(gratitude.articleId);
            });

            return li;
        }

        showEmptyGratitudesState() {
            if (!this.container) return;

            const messages = {
                'all': 'Благодарностей пока нет. Будьте первым!',
                'gd': 'Генеральный директор еще не отправлял благодарности',
                'sent': 'Вы еще не отправляли благодарности',
                'received': 'Вас еще никто не благодарил'
            };

            const currentFilter = this.gratitudesFilters ?
                this.gratitudesFilters.querySelector('input[name="type"]:checked').value : 'all';
            const message = messages[currentFilter] || messages['all'];

            this.container.innerHTML = `
                <div class="no-gratitudes">${message}</div>
            `;
        }

        handleFilterChange() {
            const allStatsItems = document.querySelectorAll('.thanks-stats-user');
            allStatsItems.forEach(item => {
                item.classList.remove('thanks-stats-user_active');
            });


            this.currentGratitudePage = 1;
            this.totalGratitudes = 0;
            this.loadGratitudes();
        }

        // ==================== ПАГИНАЦИЯ ====================
        updatePagination() {
            if (!this.pagination) {
                return;
            }
            if (this.totalPages <= 1) {

                this.pagination.innerHTML = '';
                return;
            }
            const isFirstPage = this.currentGratitudePage <= 1;
            const isLastPage = this.currentGratitudePage >= this.totalPages;

            this.pagination.innerHTML = `
                <div class="pagination__controls">
                    <button class="pagination__btn text ${isFirstPage ? 'pagination__btn_disabled' : ''}" 
                            id="prevPageBtn" 
                            ${isFirstPage ? 'disabled' : ''}
                            aria-label="Предыдущая страница">
                        ←
                    </button>
                    
                    <div class="pagination__info">
                        <span class="pagination__current text">${this.currentGratitudePage}</span>
                        <span class="pagination__separator text">/</span>
                        <span class="pagination__total text">${this.totalPages}</span>
                    </div>
                    
                    <button class="pagination__btn text ${isLastPage ? 'pagination__btn_disabled' : ''}" 
                            id="nextPageBtn" 
                            ${isLastPage ? 'disabled' : ''}
                            aria-label="Следующая страница">
                        →
                    </button>
                </div>
            `;

            if (!isFirstPage) {
                const prevBtn = document.getElementById('prevPageBtn');
                prevBtn.addEventListener('click', () => {
                    this.handlePageNavigation('prev');
                });
            }

            if (!isLastPage) {
                const nextBtn = document.getElementById('nextPageBtn');
                nextBtn.addEventListener('click', () => {
                    this.handlePageNavigation('next');
                });
            }

        }

        handlePageNavigation(direction) {
            if (direction === 'prev' && this.currentGratitudePage > 1) {
                this.currentGratitudePage--;
                this.loadGratitudes();
            } else if (direction === 'next' && this.currentGratitudePage < this.totalPages) {
                this.currentGratitudePage++;
                this.loadGratitudes();
            }
        }

        // ==================== ВЫБОР КОЛИЧЕСТВА ЭЛЕМЕНТОВ НА СТРАНИЦЕ ====================
        createPageSizeSelector() {
            const existingSelector = document.querySelector('.page-size-selector');
            if (existingSelector) {
                return;
            }
            const pageSizeContainer = document.createElement('div');
            pageSizeContainer.className = 'page-size-selector';
            pageSizeContainer.innerHTML = `
                <label class="page-size-label text">Показывать по:</label>
                <select class="page-size-select text" id="pageSizeSelect">
                    <option value="5" ${this.pageSize === 5 ? 'selected' : ''}>5</option>
                    <option value="10" ${this.pageSize === 10 ? 'selected' : ''}>10</option>
                    <option value="20" ${this.pageSize === 20 ? 'selected' : ''}>20</option>
                    <option value="30" ${this.pageSize === 30 ? 'selected' : ''}>30</option>
                    <option value="50" ${this.pageSize === 50 ? 'selected' : ''}>50</option>
                    <option value="75" ${this.pageSize === 75 ? 'selected' : ''}>75</option>
                </select>
            `;
            const pageSizeSelect = pageSizeContainer.querySelector('#pageSizeSelect');
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentGratitudePage = 1;
                this.totalGratitudes = 0; // ВАЖНО: сбрасываем счетчик
                this.loadGratitudes();
            });
            const thanksTitle = document.querySelector('.thanks__title');
            const thanksFilters = document.querySelector('.thanks-filters');
            if (thanksTitle && thanksFilters) {
                thanksTitle.parentNode.insertBefore(pageSizeContainer, thanksFilters);
            } else {
                console.warn('Could not find required elements for page size selector placement');
            }
        }

        // ==================== ЛАЙКИ ====================
        async handleLikeClick(articleId) {
            try {
                const requestData = {
                    articleId: articleId,
                    userId: appConfig.currentUserId,
                    siteId: appConfig.siteId,
                    companyId: appConfig.companyId
                };
                const response = await fetch(`${appConfig.springApiUrl}/gratitude/like`, {                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.status === 'success') {
                    this.updateLikeDisplay(articleId, result.likeCount, result.userLiked);
                } else {
                    console.error('Like operation failed:', result.message);
                }
            } catch (error) {
                console.error('Error toggling like:', error);
            }
        }

        updateLikeDisplay(articleId, likeCount, userLiked) {
            const likeBtn = document.querySelector(`.thanks-btn[data-article-id="${articleId}"]`);
            if (likeBtn) {
                const likeCountEl = likeBtn.querySelector('.thanks-btn__text');
                likeCountEl.textContent = likeCount;
                if (userLiked) {
                    likeBtn.classList.add('thanks-btn_active');
                } else {
                    likeBtn.classList.remove('thanks-btn_active');
                }
            }
            if (this.currentGratitudeData && this.currentGratitudeData.articleId === articleId) {
                if (this.modalLikeCount) {
                    this.modalLikeCount.textContent = likeCount;
                }
                if (this.modalLikeBtn) {
                    if (userLiked) {
                        this.modalLikeBtn.classList.add('thanks-btn_active');
                    } else {
                        this.modalLikeBtn.classList.remove('thanks-btn_active');
                    }
                }
            }
        }

        // ==================== СТАТИСТИКА ====================
        async loadStatistics() {
            try {
                if (this.topThankersList) {
                    this.topThankersList.innerHTML = '<div class="stats-loading">Загрузка...</div>';
                }
                if (this.topThankedList) {
                    this.topThankedList.innerHTML = '<div class="stats-loading">Загрузка...</div>';
                }
                const [thankersData, thankedData] = await Promise.all([
                    this.loadTopThankers(),
                    this.loadTopThanked()
                ]);
                this.renderTopThankers(thankersData);
                this.renderTopThanked(thankedData);
            } catch (error) {
                console.error('Error loading statistics:', error);
                this.showStatisticsError();
            }
        }

        async loadTopThankers() {
            const requestData = {
                siteId: appConfig.siteId,
                userId: appConfig.currentUserId
            };
            const response = await fetch(`${appConfig.springApiUrl}/gratitude/top-thankers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();
            return data.status === 'success' ? data.users || [] : [];
        }

        async loadTopThanked() {
            const requestData = {
                siteId: appConfig.siteId,
                userId: appConfig.currentUserId
            };
            const response = await fetch(`${appConfig.springApiUrl}/gratitude/thanked-most-of-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            const data = await response.json();
            return data.status === 'success' ? data.users || [] : [];
        }

        renderTopThankers(users) {
            if (!this.topThankersList) return;

            if (!users || users.length === 0) {
                this.topThankersList.innerHTML = '<div class="no-stats">Еще никто не отправлял благодарности</div>';
                return;
            }

            this.topThankersList.innerHTML = users.map((user, index) => {
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
                const avatarColor = this.getAvatarColor(user.userId || user.id);

                return `
                    <li class="thanks-stats__item thanks-stats-user" data-user-id="${user.userId}" data-filter="sent">
                        <div class="thanks-stats-user__avatar" style="background-color: ${avatarColor}">
                            <img class="cover-image" src="${user.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" alt="${fullName}" onerror="this.style.display='none'" />
                            <span class="thanks-stats-user__avatar-name">${this.getInitials(fullName)}</span>
                        </div>
                        <div class="thanks-stats-user__about">
                            <p class="thanks-stats-user__name text">${fullName}</p>
                            ${user.position ? `<span class="thanks-stats-user__work text">${user.position}</span>` : ''}
                        </div>
                        <div class="thanks-stats-user__counter">
                            <span class="thanks-stats-user__count text">${user.thankedQty || 0}</span>
                            <svg width="9" height="12" viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 12C2.0145 12 0 10.5 0 7.875C0 6.75 0.375 4.875 1.875 3.375C1.6875 4.5 2.8125 4.875 2.8125 4.875C2.25 3 3.75 0.375 6 0C5.73225 1.5 5.625 3 7.5 4.5C8.4375 5.25 9 6.54675 9 7.875C9 10.5 6.9855 12 4.5 12ZM4.5 11.25C5.74275 11.25 6.75 10.5 6.75 9.1875C6.75 8.625 6.5625 7.6875 5.8125 6.9375C5.90625 7.5 5.25 7.875 5.25 7.875C5.53125 6.9375 4.875 5.4375 3.75 5.25C3.88425 6 3.9375 6.75 3 7.5C2.53125 7.875 2.25 8.523 2.25 9.1875C2.25 10.5 3.25725 11.25 4.5 11.25Z"/>
                            </svg>
                        </div>
                    </li>
                `;
            }).join('');
            this.addStatsClickHandlersForThankers(this.topThankersList);
        }

        renderTopThanked(users) {
            if (!this.topThankedList) return;
            if (!users || users.length === 0) {
                this.topThankedList.innerHTML = '<div class="no-stats">Еще никто не получал благодарности</div>';
                return;
            }

            const displayedUsers = users.slice(0, 4);

            this.topThankedList.innerHTML = displayedUsers.map((user, index) => {
                const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
                const avatarColor = this.getAvatarColor(user.userId || user.id);

                return `
                    <li class="thanks-stats__item thanks-stats-user" data-user-id="${user.userId}" data-filter="received">
                        <div class="thanks-stats-user__avatar" style="background-color: ${avatarColor}">
                            <img class="cover-image" src="${user.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" alt="${fullName}" onerror="this.style.display='none'" />
                            <span class="thanks-stats-user__avatar-name">${this.getInitials(fullName)}</span>
                        </div>
                        <div class="thanks-stats-user__about">
                            <p class="thanks-stats-user__name text">${fullName}</p>
                            ${user.position ? `<span class="thanks-stats-user__work text">${user.position}</span>` : ''}
                        </div>
                        <div class="thanks-stats-user__counter">
                            <span class="thanks-stats-user__count text">${user.wasThankedQty || 0}</span>
                            <svg width="9" height="12" viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.5 12C2.0145 12 0 10.5 0 7.875C0 6.75 0.375 4.875 1.875 3.375C1.6875 4.5 2.8125 4.875 2.8125 4.875C2.25 3 3.75 0.375 6 0C5.73225 1.5 5.625 3 7.5 4.5C8.4375 5.25 9 6.54675 9 7.875C9 10.5 6.9855 12 4.5 12ZM4.5 11.25C5.74275 11.25 6.75 10.5 6.75 9.1875C6.75 8.625 6.5625 7.6875 5.8125 6.9375C5.90625 7.5 5.25 7.875 5.25 7.875C5.53125 6.9375 4.875 5.4375 3.75 5.25C3.88425 6 3.9375 6.75 3 7.5C2.53125 7.875 2.25 8.523 2.25 9.1875C2.25 10.5 3.25725 11.25 4.5 11.25Z"/>
                            </svg>
                        </div>
                    </li>
                `;
            }).join('');
            this.addStatsClickHandlersForThanked(this.topThankedList);
        }

        addStatsClickHandlersForThankers(container) {
            container.querySelectorAll('.thanks-stats-user').forEach(item => {
                item.addEventListener('click', () => {
                    const userId = item.getAttribute('data-user-id');
                    this.applyUserFilter(userId, "sent");
                });
            });
        }

        addStatsClickHandlersForThanked(container) {
            container.querySelectorAll('.thanks-stats-user').forEach(item => {
                item.addEventListener('click', () => {
                    const userId = item.getAttribute('data-user-id');
                    this.applyUserFilterReceived(userId, "received");
                });
            });
        }

        applyUserFilter(userId, filterType) {

            if (!userId) {
                console.error('No userId provided for filtering');
                return;
            }

            const sentFilterRadio = this.gratitudesFilters ?
                this.gratitudesFilters.querySelector(`input[name="type"][value="${filterType}"]`) : null;
            if (sentFilterRadio) {
                sentFilterRadio.checked = true;
            }

            this.currentGratitudePage = 1;
            this.loadGratitudesWithSpecificUser(userId);

            const thanksMain = document.querySelector('.thanks__main');
            if (thanksMain) {
                thanksMain.scrollIntoView({
                    behavior: 'smooth'
                });
            }

            this.highlightActiveUserInStats(userId, filterType);
        }

        applyUserFilterReceived(userId, filterType) {

            if (!userId) {
                console.error('No userId provided for filtering');
                return;
            }

            const receivedFilterRadio = this.gratitudesFilters ?
                this.gratitudesFilters.querySelector(`input[name="type"][value="${filterType}"]`) : null;
            if (receivedFilterRadio) {
                receivedFilterRadio.checked = true;
            }

            this.currentGratitudePage = 1;
            this.loadGratitudesWithSpecificUserReceived(userId);

            const thanksMain = document.querySelector('.thanks__main');
            if (thanksMain) {
                thanksMain.scrollIntoView({
                    behavior: 'smooth'
                });
            }

            this.highlightActiveUserInStats(userId, filterType);
        }

        async loadGratitudesWithSpecificUser(specificUserId) {
            if (this.isLoadingGratitudes || !this.container) return;

            if (!specificUserId) {
                console.error('No specificUserId provided to loadGratitudesWithSpecificUser');
                return;
            }

            this.isLoadingGratitudes = true;
            if (this.container) {
                this.container.innerHTML = '<div class="loading-spinner">Загрузка...</div>';
            }
            if (this.pagination) {
                this.pagination.classList.add('pagination_is-loading');
            }

            try {
                const requestData = {
                    siteId: appConfig.siteId,
                    page: this.currentGratitudePage,
                    pageSize: this.pageSize,
                    filter: "sent",
                    userId: specificUserId
                };


                const response = await fetch(`${appConfig.springApiUrl}/gratitude`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    const validGratitudes = data.gratitudes || [];
                    const displayedGratitudes = validGratitudes.slice(0, this.pageSize);

                    if (data.hasMore) {
                        this.totalGratitudes = (this.currentGratitudePage - 1) * this.pageSize + validGratitudes.length + 1;
                    } else {
                        this.totalGratitudes = (this.currentGratitudePage - 1) * this.pageSize + displayedGratitudes.length;
                    }

                    this.totalPages = Math.ceil(this.totalGratitudes / this.pageSize);

                    if (this.container) {
                        this.container.innerHTML = '';
                    }

                    if (displayedGratitudes.length > 0) {
                        this.renderGratitudes(displayedGratitudes);
                    } else {
                        this.showEmptyGratitudesState();
                    }

                    this.updatePagination();
                } else {
                    console.error('Error in specific user gratitudes:', data.message);
                    this.showEmptyGratitudesState();
                    this.updatePagination();
                }
            } catch (error) {
                console.error('Error fetching specific user gratitudes:', error);
                this.showEmptyGratitudesState();
                this.updatePagination();
            } finally {
                this.isLoadingGratitudes = false;
                if (this.pagination) {
                    this.pagination.classList.remove('pagination_is-loading');
                }
            }
        }

        async loadGratitudesWithSpecificUserReceived(specificUserId) {
            if (this.isLoadingGratitudes) return;

            if (!specificUserId) {
                console.error('No specificUserId provided to loadGratitudesWithSpecificUserReceived');
                return;
            }

            this.isLoadingGratitudes = true;
            if (this.container) {
                this.container.innerHTML = '<div class="loading-spinner">Загрузка...</div>';
            }
            if (this.pagination) {
                this.pagination.classList.add('pagination_is-loading');
            }

            try {
                const requestData = {
                    siteId: appConfig.siteId,
                    page: this.currentGratitudePage,
                    pageSize: this.pageSize,
                    filter: "received",
                    userId: specificUserId
                };


                const response = await fetch(`${appConfig.springApiUrl}/gratitude`, {                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    const validGratitudes = data.gratitudes || [];
                    const displayedGratitudes = validGratitudes.slice(0, this.pageSize);

                    if (data.hasMore) {
                        this.totalGratitudes = (this.currentGratitudePage - 1) * this.pageSize + validGratitudes.length + 1;
                    } else {
                        this.totalGratitudes = (this.currentGratitudePage - 1) * this.pageSize + displayedGratitudes.length;
                    }

                    this.totalPages = Math.ceil(this.totalGratitudes / this.pageSize);

                    if (this.container) {
                        this.container.innerHTML = '';
                    }

                    if (displayedGratitudes.length > 0) {
                        this.renderGratitudes(displayedGratitudes);
                    } else {
                        this.showEmptyGratitudesState();
                    }

                    this.updatePagination();
                } else {
                    console.error('Error in specific user received gratitudes:', data.message);
                    this.showEmptyGratitudesState();
                    this.updatePagination();
                }
            } catch (error) {
                console.error('Error fetching specific user received gratitudes:', error);
                this.showEmptyGratitudesState();
                this.updatePagination();
            } finally {
                this.isLoadingGratitudes = false;
                if (this.pagination) {
                    this.pagination.classList.remove('pagination_is-loading');
                }
            }
        }

        showStatisticsError() {
            if (this.topThankersList) {
                this.topThankersList.innerHTML = '<div class="no-stats">Ошибка загрузки статистики</div>';
            }
            if (this.topThankedList) {
                this.topThankedList.innerHTML = '<div class="no-stats">Ошибка загрузки статистики</div>';
            }
        }

        // ==================== MODAL FUNCTIONALITY ====================
        openModal(gratitudeData) {
            if (!gratitudeData || !this.modal) return;

            const articleId = gratitudeData.articleId;
            const gratitudeElement = document.querySelector(`.thanks-item[data-article-id="${articleId}"]`);
            if (gratitudeElement) {
                const likeBtn = gratitudeElement.querySelector('.thanks-btn');
                const likeCount = likeBtn ? parseInt(likeBtn.querySelector('.thanks-btn__text').textContent) : 0;
                const isLiked = likeBtn ? likeBtn.classList.contains('thanks-btn_active') : false;

                // Обновляем данные перед открытием модального окна
                const updatedGratitudeData = {
                    ...gratitudeData,
                    likeQty: likeCount,
                    userLiked: isLiked
                };


                this.currentGratitudeData = updatedGratitudeData;
                this.populateModal(updatedGratitudeData);
            } else {


                this.currentGratitudeData = gratitudeData;
                this.populateModal(gratitudeData);
            }

            this.modal.classList.add('gratitude-modal_is-open');
            document.body.style.overflow = 'hidden';
        }

        closeModal() {
            if (!this.modal) return;

            this.modal.classList.remove('gratitude-modal_is-open');
            document.body.style.overflow = '';
            this.currentGratitudeData = null;
        }

        populateModal(gratitude) {
            if (!this.modalAuthorAvatar || !this.modalAuthorName || !this.modalDate) {
                console.error('Modal elements not found');
                return;
            }

            const author = gratitude.author;
            const authorAvatarColor = this.getAvatarColor(author.userId || author.id);

            // Очищаем содержимое аватара
            this.modalAuthorAvatar.innerHTML = '';

            // Создаем элементы для аватара
            const avatarImg = document.createElement('img');
            avatarImg.className = 'cover-image';
            avatarImg.src = author.portraitUrl || appConfig.contextPath + '/image/user_male_portrait';
            avatarImg.alt = author.fullName;
            avatarImg.onerror = () => {
                avatarImg.style.display = 'none';
                const initialsSpan = document.createElement('span');
                initialsSpan.className = 'user-label__avatar-name';
                initialsSpan.textContent = this.getInitials(author.fullName);
                this.modalAuthorAvatar.appendChild(initialsSpan);
            };

            const initialsSpan = document.createElement('span');
            initialsSpan.className = 'user-label__avatar-name';
            initialsSpan.textContent = this.getInitials(author.fullName);

            this.modalAuthorAvatar.appendChild(avatarImg);
            this.modalAuthorAvatar.appendChild(initialsSpan);
            this.modalAuthorAvatar.style.backgroundColor = authorAvatarColor;

            // Заполняем текстовые поля
            this.modalAuthorName.textContent = author.fullName || 'Неизвестный автор';
            this.modalDate.textContent = this.formatDate(gratitude.timestamp);
            if (this.modalAuthorPosition) {
                this.modalAuthorPosition.textContent = author.position || '';
            }

            if (this.modalGratitudeText) {
                this.modalGratitudeText.innerHTML = this.escapeHtml(gratitude.articleText);
            }

            const likeCount = gratitude.likeQty || 0;
            if (this.modalLikeCount) {
                this.modalLikeCount.textContent = likeCount;
            }

            if (this.modalLikeBtn) {
                if (gratitude.userLiked) {
                    this.modalLikeBtn.classList.add('thanks-btn_active');
                } else {
                    this.modalLikeBtn.classList.remove('thanks-btn_active');
                }
            }

            this.populateRecipientsList(gratitude.recipients || []);
        }

        populateRecipientsList(recipients) {
            if (!this.modalRecipientsList) return;

            this.modalRecipientsList.innerHTML = '';

            if (!recipients || recipients.length === 0) {
                const noRecipients = document.createElement('li');
                noRecipients.className = 'thanks-gratitude-modal-list__item';
                noRecipients.innerHTML = `
            <div class="thanks-gratitude-modal-list__item-content"> 
                <span class="text">Нет получателей</span>
            </div>
        `;
                this.modalRecipientsList.appendChild(noRecipients);
                return;
            }

            recipients.forEach(recipient => {
                const recipientItem = document.createElement('li');
                recipientItem.className = 'thanks-gratitude-modal-list__item';
                const avatarColor = this.getAvatarColor(recipient.userId || recipient.id);

                recipientItem.innerHTML = `
            <div class="thanks-gratitude-modal-list__item-content"> 
                <div class="thanks-gratitude-modal-list__item-avatar" style="background-color: ${avatarColor}"> 
                    <img class="cover-image" 
                         src="${recipient.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" 
                         alt="${recipient.fullName}" 
                         onerror="this.style.display='none'" />
                    <span class="thanks-gratitude-modal-list__item-avatar-name">${this.getInitials(recipient.fullName)}</span> 
                </div>
                <div class="thanks-gratitude-modal-list__item-about"> 
                    <p class="thanks-gratitude-modal-list__item-name">${recipient.fullName}</p> 
                    ${recipient.position ? `<span class="thanks-gratitude-modal-list__item-work">${recipient.position}</span>` : ''} 
                </div>
            </div>
        `;
                this.modalRecipientsList.appendChild(recipientItem);
            });
        }

        async handleModalLikeClick() {
            if (!this.currentGratitudeData) return;

            const articleId = this.currentGratitudeData.articleId;
            await this.handleLikeClick(articleId);


            if (this.currentGratitudeData) {
                const likeBtn = document.querySelector(`.thanks-btn[data-article-id="${articleId}"]`);
                if (likeBtn) {
                    const likeCountEl = likeBtn.querySelector('.thanks-btn__text');
                    if (this.modalLikeCount) {
                        this.modalLikeCount.textContent = likeCountEl.textContent;
                    }

                    if (this.modalLikeBtn) {
                        if (likeBtn.classList.contains('thanks-btn_active')) {
                            this.modalLikeBtn.classList.add('thanks-btn_active');
                        } else {
                            this.modalLikeBtn.classList.remove('thanks-btn_active');
                        }
                    }
                }
            }
        }

        // ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
        async loadGeneralDirector() {
            try {
                const response = await fetch(`${appConfig.springApiUrl}/director?siteId=${appConfig.siteId}&companyId=${appConfig.companyId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.status === 'success') {
                    this.generalDirectorId = data.directorId;
                } else {
                    console.warn('Failed to load general director:', data.message);
                    this.generalDirectorId = null;
                }
            } catch (error) {
                console.error('Error loading general director:', error);
                this.generalDirectorId = null;
            }
        }

        async loadResponsiblePerson() {
            try {
                const response = await fetch(`${appConfig.springApiUrl}/responsible?siteId=${appConfig.siteId}&companyId=${appConfig.companyId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }


                const userData = await response.json();

                if (userData && userData.userId) {
                    this.displayResponsiblePersonInFooter(userData);
                } else {
                    console.warn('No responsible person data received');
                    this.hideResponsibleSection();
                }

            } catch (error) {
                console.error('Error loading responsible person:', error);
                this.hideResponsibleSection();
            }
        }

        // ==================== ДОБАВЛЕНИЕ SECTION-INFO ====================
        addSectionInfo() {
            const thanksStats = document.querySelector('.thanks-stats');
            if (!thanksStats) return;


            if (thanksStats.querySelector('.section-info')) {
                return;
            }


            const sectionInfoHTML = `
        <div class="section-info">
            <button class="section-info__btn" id="sectionInfoBtn">
                <img src="${appConfig.contextPath}/icons/question.svg" alt="Информация" />
            </button>
            <div class="section-info__popover" id="sectionInfoPopover">
                <div class="section-info__popover-header">
                    <span class="section-info__popover-title">Задайте вопрос о работе сервиса</span>
                    <button class="section-info__popover-close" id="sectionInfoClose">
                        <img src="${appConfig.contextPath}/icons/close.svg" alt="Закрыть" />
                    </button>
                </div>
                <div class="section-info__popover-body">
                    <div class="section-info__popover-contacts">
                        <!-- Контакты будут заполнены динамически -->
                    </div>
                    <div class="section-info__popover-user user-label">
                        <!-- Информация об ответственном лице будет заполнена динамически -->
                    </div>
                </div>
            </div>
        </div>
    `;
            thanksStats.insertAdjacentHTML('beforeend', sectionInfoHTML);
            setTimeout(() => {
                this.initializeSectionInfo();
            }, 100);
        }

        initializeSectionInfo() {
            const sectionInfoBtn = document.getElementById('sectionInfoBtn');
            const sectionInfoPopover = document.getElementById('sectionInfoPopover');
            const sectionInfoClose = document.getElementById('sectionInfoClose');

            if (!sectionInfoBtn || !sectionInfoPopover || !sectionInfoClose) {
                console.error('Section info elements not found');
                return;
            }

            this.populateSectionInfoFromFooter();

            sectionInfoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSectionInfoPopover();
            });

            sectionInfoClose.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeSectionInfoPopover();
            });


            document.addEventListener('click', (e) => {
                if (!sectionInfoPopover.contains(e.target) && !sectionInfoBtn.contains(e.target)) {
                    this.closeSectionInfoPopover();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sectionInfoPopover.classList.contains('section-info__popover_is-open')) {
                    this.closeSectionInfoPopover();
                }
            });
        }

        setupFooterObserver() {
            const footerObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList' || mutation.type === 'subtree') {
                        const footerUser = document.querySelector('.footer-user');
                        if (widget_footerUser) {
                            this.populateSectionInfoFromFooter();
                        }
                    }
                });
            });

            const footer = document.querySelector('.widget_footer');
            if (footer) {
                footerObserver.observe(footer, {
                    childList: true,
                    subtree: true,
                    characterData: true
                });
            }
        }

        populateSectionInfoFromFooter() {

            setTimeout(() => {
                const footerUser = document.querySelector('.widget_footer-user');
                const popoverContacts = document.querySelector('.section-info__popover-contacts');
                const popoverUser = document.querySelector('.section-info__popover-user');

                if (!footerUser || !popoverContacts || !popoverUser) {
                    console.warn('Footer user data not found, retrying...');
                    setTimeout(() => this.populateSectionInfoFromFooter(), 1000);
                    return;
                }

                const phoneLink = footerUser.querySelector('a[href^="tel:"]');
                const emailLink = footerUser.querySelector('a[href^="mailto:"]');
                const userName = footerUser.querySelector('.widget_footer-user__name');
                const userPosition = footerUser.querySelector('.widget_footer-user__work');
                const userAvatar = footerUser.querySelector('.widget_footer-user__avatar');

                let contactsHTML = '';
                if (emailLink) {
                    const email = emailLink.querySelector('.widget_footer-user__contacts-item-text')?.textContent ||
                        emailLink.getAttribute('href')?.replace('mailto:', '');
                    contactsHTML += `<a class="text" href="mailto:${email}">${email}</a>`;
                }
                if (phoneLink) {
                    const phone = phoneLink.querySelector('.widget_footer-user__contacts-item-text')?.textContent ||
                        phoneLink.getAttribute('href')?.replace('tel:', '');
                    contactsHTML += `<span class="text">${phone}</span>`;
                }

                if (popoverContacts) {
                    popoverContacts.innerHTML = contactsHTML;
                }

                if (popoverUser && userName && userPosition && userAvatar) {
                    const userNameText = userName.textContent;
                    const userPositionText = userPosition.textContent;
                    const userAvatarHTML = userAvatar.innerHTML;
                    const avatarColor = userAvatar.style.backgroundColor;

                    popoverUser.innerHTML = `
                <div class="user-label__avatar" style="background-color: ${avatarColor || '#f9a825'}">
                    ${userAvatarHTML}
                </div>
                <div class="user-label__about">
                    <p class="user-label__name text">${userNameText}</p>
                    <div class="user-label__description">
                        <span class="user-label__description-item user-label__work">${userPositionText}</span>
                    </div>
                </div>
            `;
                }
            }, 500);
        }

        toggleSectionInfoPopover() {
            const sectionInfoPopover = document.getElementById('sectionInfoPopover');
            if (sectionInfoPopover) {
                if (sectionInfoPopover.classList.contains('section-info__popover_is-open')) {
                    this.closeSectionInfoPopover();
                } else {
                    this.openSectionInfoPopover();
                }
            }
        }

        openSectionInfoPopover() {
            const sectionInfoPopover = document.getElementById('sectionInfoPopover');
            if (sectionInfoPopover) {
                sectionInfoPopover.classList.add('section-info__popover_is-open');
            }
        }

        closeSectionInfoPopover() {
            const sectionInfoPopover = document.getElementById('sectionInfoPopover');
            if (sectionInfoPopover) {
                sectionInfoPopover.classList.remove('section-info__popover_is-open');
            }
        }


        hideResponsibleSection() {
            const footerUser = document.querySelector('.widget_footer-user');
            if (footerUser) {
                footerUser.innerHTML = `
                    <div class="widget_footer-user__about">
                        <p class="widget_footer-user__name">Информация об ответственном лице недоступна</p>
                    </div>
                `;
            }
        }

        displayResponsiblePersonInFooter(user) {
            const footerUser = document.querySelector('.widget_footer-user');
            if (!footerUser || !user) return;

            const avatarColor = this.getAvatarColor(user.userId);
            const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();

            footerUser.innerHTML = `
                <div class="widget_footer-user__avatar" style="background-color: ${avatarColor}">
                    <img class="cover-image" 
                         src="${user.portraitUrl || appConfig.contextPath + '/image/user_male_portrait'}" 
                         alt="${fullName}" 
                         onerror="this.style.display='none'" />
                    <span class="widget_footer-user__avatar-name">${this.getInitials(fullName)}</span>
                </div>
                <div class="widget_footer-user__about">
                    <p class="widget_footer-user__name">${fullName}</p>
                    ${user.position ? `<div class="user-label__description">
                        <span class="widget_footer-user__work text">${user.position}</span>
                    </div>` : ''}
                    <div class="widget_footer-user__contacts">
                        ${user.phone ? `
                        <a href="tel:${user.phone}" class="widget_footer-user__contacts-item">
                            <span class="widget_footer-user__contacts-item-text">📞 ${user.phone}</span>
                        </a>
                        ` : ''}
                        ${user.email ? `
                        <a href="mailto:${user.email}" class="widget_footer-user__contacts-item">
                            <span class="widget_footer-user__contacts-item-text">📧 ${user.email}</span>
                        </a>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        getAvatarColor(userId) {
            const colors = ['#f9a825', '#2196f3', '#4caf50', '#ff5722', '#9c27b0', '#009688'];
            const index = parseInt(userId) % colors.length;
            return colors[index];
        }

        getInitials(fullName) {
            if (!fullName) return '??';
            return fullName.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2);
        }

        formatDate(timestamp) {
            if (!timestamp) return 'Неизвестная дата';

            try {
                const timestampNum = parseInt(timestamp);
                if (isNaN(timestampNum)) return 'Неверная дата';

                const date = new Date(timestampNum);
                if (isNaN(date.getTime())) return 'Неверная дата';

                return date.toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                console.error('Date formatting error:', e);
                return 'Ошибка даты';
            }
        }

        escapeHtml(unsafe) {
            if (!unsafe) return '';
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                .replace(/\n/g, '<br>');
        }


        refresh() {
            this.refreshAllData();
        }


        destroy() {
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
            if (this.controller) {
                this.controller.abort();
                this.controller = null;
            }

            this.selectedUsers = [];
            this.lastSearchResults = [];
            this.currentGratitudeData = null;


            this.removeEventListeners();


            if (this.container) {
                this.container.innerHTML = '';
            }


            this.boundHandlers = null;


            this._initialized = false;

        }

        removeEventListeners() {

            if (!this.boundHandlers) {
                return;
            }
            if (this.searchInput) {
                this.searchInput.removeEventListener('input', this.boundHandlers.handleSearchInput);
                this.searchInput.removeEventListener('focus', this.boundHandlers.handleSearchFocus);
            }
            document.removeEventListener('click', this.boundHandlers.handleDocumentClick);

            if (this.searchInputWrapper) {
                this.searchInputWrapper.removeEventListener('click', this.boundHandlers.handleChipClick);
            }

            if (this.sendButton) {
                this.sendButton.removeEventListener('click', this.boundHandlers.handleSendGratitude);
            }

            if (this.gratitudesFilters) {
                this.gratitudesFilters.removeEventListener('change', this.boundHandlers.handleFilterChange);
            }

            if (this.modalCloseBtn) {
                this.modalCloseBtn.removeEventListener('click', this.boundHandlers.handleModalClose);
            }

            if (this.modal) {
                this.modal.removeEventListener('click', this.boundHandlers.handleModalClick);
            }

            if (this.modalLikeBtn) {
                this.modalLikeBtn.removeEventListener('click', this.boundHandlers.handleModalLike);
            }

            document.removeEventListener('keydown', this.boundHandlers.handleEscapeKey);
            document.removeEventListener('visibilitychange', this.boundHandlers.handleVisibilityChange);

        }

    }

    // ==================== ЗАПУСК ПРИЛОЖЕНИЯ ====================
    function startWidget() {

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeGratitudeWidget);
        } else {
            setTimeout(initializeGratitudeWidget, 100);
        }

        if (window.Liferay) {
            Liferay.on('allPortletsReady', function () {
                initializeGratitudeWidget();
            });
        }
    }

    startWidget();

    setTimeout(() => {
        if (!widgetInstance) {
            initializeGratitudeWidget();
        }
    }, 3000);

    // ==================== SPA NAVIGATION DEBUGGER ====================
    if (window.Liferay) {

        let navigationTimeout;

        Liferay.on('endNavigate', function (event) {

            clearTimeout(navigationTimeout);
            navigationTimeout = setTimeout(() => {
                const hasContainer = !!document.getElementById('gratitudesList');

                if (hasContainer) {

                    if (window.gratitudeWidgetInstance) {
                        window.gratitudeWidgetInstance.destroy();
                    }
                    window.gratitudeWidgetInstance = null;

                    setTimeout(() => {
                        initializeGratitudeWidget();
                    }, 500);
                } else {

                    if (window.gratitudeWidgetInstance) {
                        window.gratitudeWidgetInstance.destroy();
                        window.gratitudeWidgetInstance = null;
                    }
                }
            }, 300);
        });
    }


    let lastUrl = window.location.href;
    new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;


            setTimeout(() => {
                if (document.getElementById('gratitudesList')) {
                    if (!window.gratitudeWidgetInstance) {
                        initializeGratitudeWidget();
                    }
                }
            }, 200);
        }
    }).observe(document, {subtree: true, childList: true});


    document.addEventListener('click', function (e) {
        const link = e.target.closest('a');
        if (link && link.href) {

        }
    });


    setTimeout(() => {

    }, 2000);


})();