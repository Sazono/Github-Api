class View {  // Создаем класс
  constructor() {
    this.app = document.getElementById('app');

    this.title = this.createElement('h1', 'title'); // используем функцию createElement
    this.title.textContent = 'Github Dashboard - Makak';

    this.searchLine = this.createElement('div', 'search-line');
    this.searchInput = this.createElement('input', 'search-input');
    this.warning = this.createElement('div', 'warning');
    this.warning.innerHTML = '';
    this.searchLine.append(this.searchInput); // Добавляем в конец элемент
    this.searchLine.append(this.warning);

    this.app.append(this.title);
    this.app.append(this.searchLine);

    this.topicRequests(); // Отображение главной страницы с топом
    this.searchInput.addEventListener('keyup', this.debounce(this.loadRep.bind(this), 800));
    this.searchInput.addEventListener('input', this.onInput.bind(this));
  }

  onInput() {

  }


  // Создание элемента
  createElement(elementTag, elementClass) {
    const element = document.createElement(elementTag); // создаем новый элемент
    if (elementClass) { // Если есть elementClass, то выполняем условия
      element.classList.add(elementClass); // Добавить класс
    }
    return element;
  }



  // Создание кнопок пагинации
  createPagination(array) {
    let table = document.querySelector('#table');
    let pagination = document.querySelector('#pagination');

    let notesOnPage = 10; // Количество записей на одной странице
    let countOfItems = Math.ceil(array.length/notesOnPage); // Сколько страниц (округление в большую сторону)
    let items = []; // Пустой массив с li

    for (let i = 1; i <= countOfItems; i++) {
      let li = document.createElement('li');
      li.innerHTML = i;
      pagination.appendChild(li);
      items.push(li); // Добавить в конец массива
    }
    items[0].classList.add('active');

    //Добавляем к кнопкам функцию при клике
    for (let item of items) {
      item.addEventListener('click', function() {
        let active = document.querySelector('#pagination li.active');
        if (active) {
          active.classList.remove('active');
        }
        item.classList.add('active'); // При нажатии добавляем li класс active

        let pageNum = +this.innerHTML;
        let notesOnPage = 10;
        let start = (pageNum - 1) * notesOnPage;
        let end = start + notesOnPage;
        let notes = array.slice(start, end); // Отрезаем кусок от массива

        table.innerHTML = '';

        for (let note of notes) {
          let table = document.querySelector('#table');
          let tr = document.createElement('tr');
          table.appendChild(tr);

          let td = document.createElement('td');
          td.innerHTML = `<a href="../ApiGit/repPage.html?${note.owner.login}&${note.name}">${note.name}</a>`;
          tr.appendChild(td);
          td = document.createElement('td');
          td.innerHTML = note.stargazers_count; // Кол-во звезд
          tr.appendChild(td);
          td = document.createElement('td');
          td.innerHTML = note.pushed_at; // Последний коммит
          tr.appendChild(td);
          td = document.createElement('td');
          td.innerHTML = `<a href="${note.html_url}" target="_blank">Ссылка</a>`; // Ссылка на репозиторий
          tr.appendChild(td);
        }
      });
    }
  }



  // Подгрузка первой страницы
  showPage(item, array) {
    let pageNum = 1;

    let notesOnPage = 10;
    let start = (pageNum - 1) * notesOnPage;
    let end = start + notesOnPage;
    let notes = array.slice(start, end); // Отрезаем кусок от массива

    table.innerHTML = '';

    for (let note of notes) {
      this.createRep(note);
    }
  }


  // Подгрузка первой партии репозиториев после поиска
  loadRep() {
    let value = this.searchInput.value;
    let warning = document.querySelector('.warning');

    if (value && !value.match(/[^a-zA-Z0-9]/g)) { // Если есть значение + проверка
      warning.innerHTML = '';
      table.innerHTML = ''; // Сначала сбрасываем значение
      pagination.innerHTML = '';
      this.repRequests(value); // Потом загружаем новое - Поиск по введенному значению
    } else if (value.match(/[^a-zA-Z0-9]/g)) { // Проверка на англиские буквы
      this.warning.innerHTML = 'Введите английские буквы или цифры';
    } else { // Если нет значения то сбрасываем
      warning.innerHTML = '';
      table.innerHTML = '';
      pagination.innerHTML = '';
      this.topicRequests();
    }
  }

  // Запрос на Github по запросу в поиске
  async repRequests(value) {

    await fetch(`https://api.github.com/search/repositories?q=${value}&sort=star`).then(res => res).then((res) => {
        res.json().then(res => {
          let users;
          users = res.items;
          this.showPage(1, users);
          this.createPagination(users);
        })
      });
    }

  // Запрос на Github по топу репозиториев
  async topicRequests() {
    let topic;
    await fetch(`https://api.github.com/search/repositories?q=topic:js&sort=star&per_page=10`).then(res => res).then((res) => {
        res.json().then(res => {
          topic = res.items;
          topic.forEach(top => this.createStroke(top));
        })
      });
  }

  // Создание ячейки
  createCell(text, tr) {
    let td = document.createElement('td');
    td.innerHTML = text;
    tr.appendChild(td);
  }

  // Создание ячеек в таблице
  createRep(repData) {
    let table = document.querySelector('#table');
    let tr = document.createElement('tr');
    table.appendChild(tr);

    let td = document.createElement('td');
    td.innerHTML = `<a href="../ApiGit/repPage.html?${repData.owner.login}&${repData.name}">${repData.name}</a>`;
    tr.appendChild(td);
    this.createCell(repData.stargazers_count, tr); // Кол-во звезд
    this.createCell(repData.pushed_at, tr); // Последний коммит
    td = document.createElement('td');
    td.innerHTML = `<a href="${repData.html_url}" target="_blank">Ссылка</a>`; // Ссылка на репозиторий
    tr.appendChild(td);
  }

  createStroke(top) {
    let table = document.querySelector('#table');
    let tr = document.createElement('tr');
    table.appendChild(tr);

    this.createCell(top.name, tr);
  }

  // Функция для задержки ввода в строку поиска
  debounce (func, wait, immediate) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
}


new View();
