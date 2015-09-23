CREATE TABLE P1 (
  ID INTEGER NOT NULL,
  DESC VARCHAR(300),
  NUM INTEGER,
  RATIO FLOAT,
  CONSTRAINT P1_PK_TREE PRIMARY KEY (ID)
);
CREATE INDEX P1_IDX_NUM_TREE ON P1 (NUM);
CREATE INDEX P1_IDX_RATIO_TREE ON P1 (RATIO);
CREATE INDEX P1_IDX_DESC_TREE ON P1 (DESC);
CREATE INDEX P1_IDX_NUM_RATIO_DESC_TREE ON P1 (NUM, RATIO, DESC);

PARTITION TABLE P1 ON COLUMN ID;

CREATE TABLE R1 (
  ID INTEGER NOT NULL,
  DESC VARCHAR(300),
  NUM INTEGER,
  RATIO FLOAT,
  CONSTRAINT R1_PK_TREE PRIMARY KEY (ID)
--  PRIMARY KEY (ID)
);
CREATE INDEX R1_IDX_NUM_HASH ON R1 (NUM);
CREATE INDEX R1_IDX_RATIO ON R1 (RATIO);
CREATE INDEX R1_IDX_DESC ON R1 (DESC);
CREATE INDEX R1_IDX_NUM_RATIO_DESC_TREE ON R1 (NUM, RATIO, DESC);

CREATE TABLE R2 (
  ID INTEGER NOT NULL,
  DESC VARCHAR(300),
  NUM INTEGER,
  RATIO FLOAT,
  CONSTRAINT R2_PK_TREE PRIMARY KEY (ID)
--  PRIMARY KEY (ID)
);
CREATE INDEX R2_IDX_NUM_HASH ON R2 (NUM);
CREATE INDEX R2_IDX_RATIO ON R2 (RATIO);
CREATE INDEX R2_IDX_DESC ON R2 (DESC);
CREATE INDEX R2_IDX_NUM_RATIO_DESC_TREE ON R2 (DESC, NUM, RATIO);


--- 
CREATE TABLE P_SCAN (
	A SMALLINT , 
	B SMALLINT NOT NULL, 
	C SMALLINT , 
	D SMALLINT , 
	E SMALLINT , 
	F SMALLINT 
);

PARTITION TABLE P_SCAN ON COLUMN B;

CREATE INDEX P_SCAN_TREE1 ON P_SCAN (A);
CREATE INDEX P_SCAN_TREE2 ON P_SCAN (B, C);
CREATE INDEX P_SCAN_TREE3 ON P_SCAN (D, E, F);


CREATE TABLE R_SCAN (
	A SMALLINT , 
	B SMALLINT , 
	C SMALLINT , 
	D SMALLINT , 
	E SMALLINT , 
	F SMALLINT 
);

CREATE INDEX R_SCAN_TREE1 ON R_SCAN (A);
CREATE INDEX R_SCAN_TREE2 ON R_SCAN (B,C);
CREATE INDEX R_SCAN_TREE3 ON R_SCAN (D, E, F);


CREATE TABLE P_SCAN2 (
	A SMALLINT , 
	B SMALLINT NOT NULL, 
	C SMALLINT , 
	D SMALLINT , 
	E SMALLINT , 
	F SMALLINT 
);
PARTITION TABLE P_SCAN2 ON COLUMN B;
CREATE INDEX P_SCAN2_TREE1 ON P_SCAN2 (C);

--- varbinary type
CREATE TABLE R_VARBINARY_TABLE (
    ID INTEGER NOT NULL,
	A VARBINARY(50),
	B VARBINARY(256),
	C VARBINARY(50),
    D VARBINARY(256),
    E VARBINARY(256),
    F VARBINARY(256)
);
CREATE INDEX R_VARBINARY_TABLE_TREE_1 ON R_VARBINARY_TABLE (A);
CREATE INDEX R_VARBINARY_TABLE_TREE_2 ON R_VARBINARY_TABLE (B, C);
--- Column D,E,F are reserved for HASH index testing in future

CREATE TABLE P_VARBINARY_TABLE (
    ID INTEGER NOT NULL,
	A VARBINARY(50) NOT NULL,
	B VARBINARY(256),
	C VARBINARY(50),
    D VARBINARY(256),
    E VARBINARY(256),
    F VARBINARY(256)
);
PARTITION TABLE P_VARBINARY_TABLE ON COLUMN A;
CREATE INDEX P_VARBINARY_TABLE_TREE_1 ON P_VARBINARY_TABLE (A);
CREATE INDEX P_VARBINARY_TABLE_TREE_2 ON P_VARBINARY_TABLE (B, C);
--- Column D,E,F are reserved for HASH index testing in future
