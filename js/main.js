// Навигация
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Глобальные переменные
let selectedRoom = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация фильтров
    initFilters();
    
    // Инициализация бронирования
    initBooking();
    
    // Инициализация модального окна
    initModal();
    
    // Анимация при скролле
    initAnimations();
    
    // Плавная прокрутка
    initSmoothScroll();
    
    // Обновление статистики фильтров
    updateFilterStats();
});

// ФИЛЬТРЫ
function initFilters() {
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            const formattedValue = value.toLocaleString('ru-RU');
            document.getElementById('rangeValue').textContent = formattedValue + '₽';
            updateFilterStats();
        });
    }
    
    // Слушатели для фильтров
    document.querySelectorAll('.filter-tag input, .filter-radio input').forEach(filter => {
        filter.addEventListener('change', updateFilterStats);
    });
}

function applyFilters() {
    const filters = getCurrentFilters();
    filterRooms(filters);
    updateRoomsSubtitle(filters);
    scrollToRooms();
}

function resetFilters() {
    // Сброс чекбоксов
    document.querySelectorAll('.filter-tag input').forEach(cb => {
        cb.checked = false;
    });
    
    // Сброс радио-кнопок
    document.querySelectorAll('.filter-radio input[value="all"]').forEach(radio => {
        radio.checked = true;
    });
    
    // Сброс слайдера цены
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
        priceRange.value = priceRange.max;
        const maxValue = parseInt(priceRange.max);
        document.getElementById('rangeValue').textContent = maxValue.toLocaleString('ru-RU') + '₽';
    }
    
    // Применение сброса
    applyFilters();
}

function getCurrentFilters() {
    const priceRange = document.getElementById('priceRange');
    const maxPrice = priceRange ? parseInt(priceRange.value) : Infinity;
    
    const selectedType = document.querySelector('.filter-radio input:checked')?.value || 'all';
    
    const filters = {
        maxPrice: maxPrice,
        roomType: selectedType,
        pets: document.getElementById('filterPets')?.checked || false,
        seaView: document.getElementById('filterSeaView')?.checked || false,
        mountainView: document.getElementById('filterMountainView')?.checked || false,
        family: document.getElementById('filterFamily')?.checked || false,
        balcony: document.getElementById('filterBalcony')?.checked || false,
        spa: document.getElementById('filterSpa')?.checked || false,
        pool: document.getElementById('filterPool')?.checked || false,
        fireplace: document.getElementById('filterFireplace')?.checked || false
    };
    
    return filters;
}

function filterRooms(filters) {
    const roomCards = document.querySelectorAll('.room-card');
    let visibleCount = 0;
    let minPrice = Infinity;
    let maxPrice = 0;
    
    roomCards.forEach(card => {
        const roomPrice = parseInt(card.getAttribute('data-price'));
        const roomType = card.getAttribute('data-type');
        
        // Проверка цены
        if (roomPrice > filters.maxPrice) {
            card.style.display = 'none';
            return;
        }
        
        // Проверка типа
        if (filters.roomType !== 'all' && roomType !== filters.roomType) {
            card.style.display = 'none';
            return;
        }
        
        // Проверка фильтров
        let showCard = true;
        
        if (filters.pets && card.getAttribute('data-pets') !== 'true') showCard = false;
        if (filters.seaView && card.getAttribute('data-seaview') !== 'true') showCard = false;
        if (filters.mountainView && card.getAttribute('data-mountainview') !== 'true') showCard = false;
        if (filters.family && card.getAttribute('data-family') !== 'true') showCard = false;
        if (filters.balcony && card.getAttribute('data-balcony') !== 'true') showCard = false;
        if (filters.spa && card.getAttribute('data-spa') !== 'true') showCard = false;
        if (filters.pool && card.getAttribute('data-pool') !== 'true') showCard = false;
        if (filters.fireplace && card.getAttribute('data-fireplace') !== 'true') showCard = false;
        
        if (showCard) {
            card.style.display = 'block';
            visibleCount++;
            
            // Обновление min/max цены
            if (roomPrice < minPrice) minPrice = roomPrice;
            if (roomPrice > maxPrice) maxPrice = roomPrice;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Показать/скрыть сообщение "Нет номеров"
    const noRooms = document.getElementById('noRooms');
    if (visibleCount === 0) {
        noRooms.style.display = 'block';
    } else {
        noRooms.style.display = 'none';
    }
    
    // Обновить счетчик
    document.getElementById('roomsCount').textContent = visibleCount;
    
    // Обновить цены в статистике
    document.getElementById('minPrice').textContent = minPrice !== Infinity ? minPrice.toLocaleString('ru-RU') + '₽' : '0₽';
    document.getElementById('maxPrice').textContent = maxPrice !== 0 ? maxPrice.toLocaleString('ru-RU') + '₽' : '0₽';
    
    return visibleCount;
}

function updateFilterStats() {
    const filters = getCurrentFilters();
    const visibleCount = filterRooms(filters);
    updateRoomsSubtitle(filters);
}

function updateRoomsSubtitle(filters) {
    const subtitle = document.getElementById('roomsSubtitle');
    if (!subtitle) return;
    
    const activeFilters = [];
    
    if (filters.pets) activeFilters.push('с животными');
    if (filters.seaView) activeFilters.push('с видом на море');
    if (filters.mountainView) activeFilters.push('с видом на горы');
    if (filters.family) activeFilters.push('семейные');
    if (filters.balcony) activeFilters.push('с балконом');
    if (filters.spa) activeFilters.push('со SPA');
    if (filters.pool) activeFilters.push('с бассейном');
    if (filters.fireplace) activeFilters.push('с камином');
    
    if (filters.roomType !== 'all') {
        const typeNames = {
            'deluxe': 'Deluxe',
            'suite': 'Suite',
            'villa': 'Villas'
        };
        activeFilters.unshift(typeNames[filters.roomType] || filters.roomType);
    }
    
    if (activeFilters.length > 0) {
        subtitle.textContent = `Найдено по фильтрам: ${activeFilters.join(', ')}`;
    } else {
        subtitle.textContent = 'Все номера курорта';
    }
}

function scrollToRooms() {
    const roomsSection = document.querySelector('.rooms-section');
    if (roomsSection) {
        roomsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// БРОНИРОВАНИЕ
function initBooking() {
    // Обработчики для кнопок выбора номера
    document.querySelectorAll('.btn-book').forEach(button => {
        button.addEventListener('click', function() {
            const roomCard = this.closest('.room-card');
            selectRoom(roomCard);
        });
    });
    
    // Обработчики для счетчиков
    document.querySelectorAll('.counter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const counter = this.closest('.counter').querySelector('.counter-value');
            let value = parseInt(counter.textContent);
            
            if (this.classList.contains('minus') && value > 0) {
                value--;
            } else if (this.classList.contains('plus')) {
                value++;
            }
            
            counter.textContent = value;
            updateTotalPrice();
        });
    });
    
    // Обработчики для дополнительных услуг
    document.querySelectorAll('.service-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', updateTotalPrice);
    });
    
    // Обработчик формы бронирования
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!selectedRoom) {
                alert('Пожалуйста, выберите номер для бронирования');
                return;
            }
            
            // Сбор данных
            const formData = {
                room: selectedRoom.name,
                price: selectedRoom.price,
                checkin: document.getElementById('checkin').value,
                checkout: document.getElementById('checkout').value,
                adults: document.getElementById('adults').textContent,
                children: document.getElementById('children').textContent,
                name: document.getElementById('guestName').value,
                email: document.getElementById('guestEmail').value,
                phone: document.getElementById('guestPhone').value,
                extras: getSelectedServices(),
                total: calculateTotalPrice()
            };
            
            // В реальном проекте здесь была бы отправка на сервер
            console.log('Данные бронирования:', formData);
            
            // Показать подтверждение
            showBookingConfirmation(formData);
            
            // Сброс формы
            resetBookingForm();
        });
    }
}

function selectRoom(roomCard) {
    const roomName = roomCard.getAttribute('data-room');
    const roomPrice = parseInt(roomCard.getAttribute('data-price'));
    const roomType = roomCard.getAttribute('data-type');
    const roomSize = roomCard.getAttribute('data-size');
    const roomView = roomCard.getAttribute('data-view');
    const roomImage = roomCard.querySelector('.room-image').style.backgroundImage;
    
    selectedRoom = {
        name: roomName,
        price: roomPrice,
        type: roomType,
        size: roomSize,
        view: roomView,
        image: roomImage
    };
    
    // Обновить отображение выбранного номера
    const selectedRoomElement = document.getElementById('selectedRoom');
    selectedRoomElement.innerHTML = `
        <div class="selected-room-content">
            <div class="selected-room-image" style="${roomImage}"></div>
            <div class="selected-room-info">
                <h4>${roomName}</h4>
                <div class="selected-room-specs">
                    <span><i class="bi bi-arrows-fullscreen"></i> ${roomSize}</span>
                    <span><i class="bi bi-binoculars"></i> ${roomView}</span>
                    <span><i class="bi bi-tag"></i> ${roomType.charAt(0).toUpperCase() + roomType.slice(1)}</span>
                </div>
                <div class="selected-room-price">${roomPrice.toLocaleString('ru-RU')} ₽/ночь</div>
            </div>
        </div>
    `;
    
    // Прокрутить к секции бронирования
    document.getElementById('bookingSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Обновить цены
    updateTotalPrice();
    
    // Показать уведомление
    showNotification(`Выбран номер: ${roomName}`, 'success');
}

function updateTotalPrice() {
    if (!selectedRoom) return;
    
    const roomPrice = selectedRoom.price;
    let extraPrice = 0;
    
    // Сумма дополнительных услуг
    document.querySelectorAll('.service-checkbox input:checked').forEach(checkbox => {
        const priceText = checkbox.closest('.service-checkbox').querySelector('.service-price').textContent;
        const price = parseInt(priceText.replace(/\D/g, ''));
        extraPrice += price;
    });
    
    const totalPrice = roomPrice + extraPrice;
    
    // Обновить отображение цен
    document.getElementById('roomPrice').textContent = roomPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('extraPrice').textContent = extraPrice.toLocaleString('ru-RU') + ' ₽';
    document.getElementById('totalPrice').textContent = totalPrice.toLocaleString('ru-RU') + ' ₽';
}

function calculateTotalPrice() {
    if (!selectedRoom) return 0;
    
    const roomPrice = selectedRoom.price;
    let extraPrice = 0;
    
    document.querySelectorAll('.service-checkbox input:checked').forEach(checkbox => {
        const priceText = checkbox.closest('.service-checkbox').querySelector('.service-price').textContent;
        const price = parseInt(priceText.replace(/\D/g, ''));
        extraPrice += price;
    });
    
    return roomPrice + extraPrice;
}

function getSelectedServices() {
    const services = [];
    document.querySelectorAll('.service-checkbox input:checked').forEach(checkbox => {
        const serviceName = checkbox.closest('.service-checkbox').querySelector('.service-name').textContent;
        const servicePrice = checkbox.closest('.service-checkbox').querySelector('.service-price').textContent;
        services.push({
            name: serviceName,
            price: servicePrice
        });
    });
    return services;
}

function showBookingConfirmation(formData) {
    const confirmationHTML = `
        <div class="booking-confirmation">
            <i class="bi bi-check-circle-fill"></i>
            <h3>Бронирование подтверждено!</h3>
            <p>Номер: <strong>${formData.room}</strong></p>
            <p>Даты: ${formData.checkin} - ${formData.checkout}</p>
            <p>Гости: ${formData.adults} взрослых, ${formData.children} детей</p>
            <p>Итого: <strong>${formData.total.toLocaleString('ru-RU')} ₽</strong></p>
            <p>Подтверждение отправлено на ${formData.email}</p>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Подтверждение бронирования</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                ${confirmationHTML}
                <button class="btn btn-accent btn-close-confirmation">Закрыть</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.querySelector('.btn-close-confirmation').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function resetBookingForm() {
    selectedRoom = null;
    
    // Сброс отображения выбранного номера
    const selectedRoomElement = document.getElementById('selectedRoom');
    selectedRoomElement.innerHTML = `
        <div class="no-selection">
            <i class="bi bi-house"></i>
            <p>Выберите номер из списка выше</p>
        </div>
    `;
    
    // Сброс формы
    document.getElementById('bookingForm').reset();
    document.getElementById('adults').textContent = '2';
    document.getElementById('children').textContent = '0';
    
    // Сброс дополнительных услуг
    document.querySelectorAll('.service-checkbox input').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Сброс цен
    document.getElementById('roomPrice').textContent = '0 ₽';
    document.getElementById('extraPrice').textContent = '0 ₽';
    document.getElementById('totalPrice').textContent = '0 ₽';
}

// МОДАЛЬНОЕ ОКНО
function initModal() {
    // Обработчики для кнопок просмотра деталей (если будут добавлены)
    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomCard = this.closest('.room-card');
            showRoomDetails(roomCard);
        });
    });
}

function showRoomDetails(roomCard) {
    const roomName = roomCard.getAttribute('data-room');
    const roomPrice = parseInt(roomCard.getAttribute('data-price'));
    const roomDescription = roomCard.getAttribute('data-description');
    const roomSize = roomCard.getAttribute('data-size');
    const roomView = roomCard.getAttribute('data-view');
    const roomFeatures = roomCard.getAttribute('data-features');
    
    // Заполнение модального окна
    document.getElementById('modalRoomName').textContent = roomName;
    document.getElementById('modalRoomPrice').textContent = roomPrice.toLocaleString('ru-RU') + ' ₽/ночь';
    document.getElementById('modalRoomSize').textContent = roomSize;
    document.getElementById('modalRoomView').textContent = roomView;
    document.getElementById('modalRoomDesc').textContent = roomDescription;
    
    // Заполнение списка особенностей
    const featuresList = document.getElementById('modalFeaturesList');
    featuresList.innerHTML = '';
    if (roomFeatures) {
        roomFeatures.split(',').forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="bi bi-check"></i> ${feature.trim()}`;
            featuresList.appendChild(li);
        });
    }
    
    // Показать модальное окно
    const modal = document.getElementById('roomModal');
    modal.classList.add('active');
    
    // Обработчик кнопки "Выбрать этот номер"
    const bookBtn = modal.querySelector('.btn-book-modal');
    bookBtn.onclick = () => {
        selectRoom(roomCard);
        modal.classList.remove('active');
    };
    
    // Закрытие модального окна
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            }
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Закрытие при клике
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Автоматическое закрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Утилиты для форматирования
function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}
