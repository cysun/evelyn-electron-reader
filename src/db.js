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

const getBooks = async () => {
  let sql = 'select * from "Books" order by "LastUpdated" desc';
  return await pool.query(sql);
};

const getBook = async id => {
  let sql = `select b."Id", b."Title", count(c."Id") as "ChaptersCount"
    from "Books" b innner join "Chapters" c on c."BookId" == b."Id"
    where b."Id" = $1
    group by b."Id", b."Title"`;
  return await pool.query(sql, [id]);
};

module.exports = {
  close,
  authenticate,
  getBooks,
  getBook
};
