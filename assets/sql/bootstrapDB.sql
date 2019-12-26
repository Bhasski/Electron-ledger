
CREATE TABLE IF NOT EXISTS LedgerMaster(
    master_id  INTEGER  PRIMARY KEY AUTOINCREMENT,
    master_name TEXT  NOT NULL,
    master_proprietor TEXT  ,
    master_address TEXT ,
    master_email TEXT UNIQUE,
    master_phone TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Business(
    b_id  INTEGER  PRIMARY KEY,
    b_name TEXT  NOT NULL,
    b_proprietor TEXT  ,
    b_address TEXT ,
    b_email TEXT UNIQUE,
    b_phone TEXT NOT NULL UNIQUE
);
CREATE TABLE  IF NOT EXISTS Product (
    p_id  INTEGER PRIMARY KEY,
    p_name TEXT  NOT NULL,
    p_dom  TEXT ,
    p_doe TEXT NOT NULL,
    p_variety TEXT,
    p_manufacturer TEXT,
    UNIQUE(p_name,p_manufacturer,p_variety) 
);
CREATE TABLE IF NOT EXISTS Business_Product_Rel(
    b_id INTEGER,
    p_id INTEGER,
    PRIMARY KEY (b_id,p_id),
    FOREIGN KEY (b_id)
        REFERENCES Business (b_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (p_id)
        REFERENCES  Product (p_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS LedgerTransaction(
    t_id INTEGER PRIMARY KEY AUTOINCREMENT,
    t_date TEXT NOT NULL,
    t_o_id TEXT NOT NULL,    
    t_b_id TEXT NOT NULL,
    t_type TEXT NOT NULL,
    t_amount REAL NOT NULL,
    t_quote_amt REAL NOT NULL,
    t_remarks TEXT,
    FOREIGN KEY (t_b_id)
        REFERENCES Business (b_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (t_o_id)
        REFERENCES  LedgerOrder (o_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS LedgerOrder(
    o_id INTEGER PRIMARY KEY AUTOINCREMENT,
    o_b_id INTEGER NOT NULL,
    o_date TEXT NOT NULL,
    o_status TEXT NOT NULL, /* completed /pending */
    o_type TEXT NOT NULL,   /* credit/debit */
    o_amount REAL NOT NULL,
    o_quote_amt REAL NOT NULL,
    o_remarks TEXT,
    FOREIGN KEY (o_b_id)
        REFERENCES Business (b_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);
CREATE TABLE IF NOT EXISTS Order_Product_Rel(
    o_id INTEGER,
    p_id INTEGER,
    PRIMARY KEY (o_id,p_id),
    FOREIGN KEY (o_id)
        REFERENCES LedgerOrder(o_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,
    FOREIGN KEY (p_id)
        REFERENCES  Product (p_id)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

INSERT into Business VALUES(1,'Punjab Beej','Anil Kumar','Jama Masjid','abc@gmail.com','9028870365');