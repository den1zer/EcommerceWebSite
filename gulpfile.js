// 1. Підключаємо встановлені плагіни
const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat'); // Хоча ви його не використовуєте в tasks, він підключений
const browserSync = require('browser-sync').create();
const { deleteAsync } = require('del');
const autoprefixer = require('gulp-autoprefixer').default || require('gulp-autoprefixer'); // Підключення виглядає правильним

// Шляхи до файлів (зручно винести в змінні)
// FIX: Зробив шляхи більш конкретними та припустив стандартну структуру папки 'src'
const paths = {
  styles: {
    src: 'src/scss/**/*.scss', // Шукати всі .scss файли в src/scss та підпапках
    dest: 'dist/css/'
  },
  html: {
    src: 'src/*.html',       // Шукати .html файли безпосередньо в папці src
    dest: 'dist/'
  },
  scripts: {
    // FIX: Припускаю, що ваші основні скрипти в src/js, а vendor - окремо
    // Якщо використовуєте тільки vendor, залиште як було або уточніть структуру
    src: 'src/js/**/*.js',   // Шукати всі .js файли в src/js та підпапках
    vendorSrc: 'src/vendor/**/*.js', // Якщо є окремі vendor скрипти
    dest: 'dist/js/'
  }
  // Можна додати шляхи для зображень, шрифтів і т.д.
};

// 2. Описуємо завдання (tasks)

// Завдання для очищення папки dist
async function clean() {
  return await deleteAsync(['dist']);
}

// Завдання для компіляції SCSS в CSS, додавання префіксів та мініфікації
function styles() {
  // FIX: Залишив ЛИШЕ ОДИН виклик autoprefixer
  return gulp.src(paths.styles.src)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ // Ось правильний виклик
      cascade: false,
      // Можна додати grid: true, якщо використовуєте CSS Grid
      overrideBrowserslist: ["last 2 versions"] // Явно вказуємо цільові браузери
    }))
    .pipe(cleanCSS({ level: 2 }))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

// Завдання для копіювання HTML
function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// Завдання для об'єднання та потенційної обробки JS (тут просто копіюємо)
function scripts() {
  // FIX: Прибрав НЕПРАВИЛЬНИЙ виклик autoprefixer звідси
  // Якщо потрібно об'єднати і vendor, і ваші скрипти:
  // return gulp.src([paths.vendorSrc, paths.scripts.src]) // Об'єднуємо масиви шляхів
  //   .pipe(concat('main.js')) // Об'єднуємо в один файл
  //   .pipe(gulp.dest(paths.scripts.dest))
  //   .pipe(browserSync.reload({ stream: true }));

  // Якщо просто копіюємо ваші скрипти:
  return gulp.src(paths.scripts.src)
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// Завдання для відстеження змін у файлах
function watchFiles() {
  browserSync.init({
    server: {
      baseDir: "./dist"
    }
  });
  // FIX: Оновив шляхи для відстеження відповідно до змін у paths
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.scripts.src, scripts);
  // Якщо є vendor скрипти і їх теж треба відстежувати:
  // gulp.watch(paths.vendorSrc, scripts);
}

// 3. Реєструємо завдання

const build = gulp.series(clean, gulp.parallel(html, styles, scripts));
const dev = gulp.series(build, watchFiles);

exports.clean = clean;
exports.styles = styles;
exports.html = html;
exports.scripts = scripts;
exports.watch = watchFiles;
exports.build = build;
exports.default = dev;
