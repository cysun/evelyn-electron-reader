const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const Store = require("electron-store");
const log = require("electron-log");

const store = new Store();

const pool = store.has("dbconfig")
  ? new Pool(store.get("dbconfig"))
  : new Pool({
      host: "localhost",
      port: 5432,
      database: "evelyn",
      client_encoding: "utf8",
      user: "cysun",
      password: "abcd"
    });

const close = () => pool.end(() => log.info("db closed"));

const authenticate = async (username, password) => {
  let sql = 'select * from "Users" where "Name" = $1';
  try {
    let result = await pool.query(sql, [username]);
    return (
      result.rows.length == 1 &&
      (await bcrypt.compare(password, result.rows[0]["Hash"]))
    );
  } catch (e) {
    log.error(e.message);
    return false;
  }
};

const getBook = id => {
  let sql = `select b."Id", b."Title", count(c."Id") as "ChaptersCount"
    from "Books" b inner join "Chapters" c on c."BookId" = b."Id"
    where b."Id" = $1
    group by b."Id", b."Title"`;
  return pool.query(sql, [id]);
};

const getBooks = () => {
  let sql = `select "Id", "Title", "Author", "LastUpdated" from "Books"
    order by "LastUpdated" desc`;
  return pool.query(sql);
};

const getChapter = (bookId, chapterNumber) => {
  let sql = `select "Id", "Name", "HtmlFileId" from "Chapters"
    where "BookId" = $1 and "Number" = $2`;
  return pool.query(sql, [bookId, chapterNumber]);
};

const getChapters = bookId => {
  let sql = `select * from "Chapters" where "BookId" = $1 order by "Number"`;
  return pool.query(sql, [bookId]);
};

const getFile = id => {
  let sql = 'select * from "Files" where "Id" = $1';
  return pool.query(sql, [id]);
};

module.exports = {
  close,
  authenticate,
  getBook,
  getBooks,
  getChapter,
  getChapters,
  getFile
};
