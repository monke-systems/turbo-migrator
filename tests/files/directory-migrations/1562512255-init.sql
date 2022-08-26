CREATE TABLE transactions
(
    id                   char(36)                                 not null,
    createdAt            datetime                                 default CURRENT_TIMESTAMP not null,
    updatedAt            datetime                                 default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    PRIMARY KEY (id, createdAt)
) charset = utf8;


CREATE TABLE IF NOT EXISTS _migrations
(
filename                    varchar(150)                                 not null,
    appliedAt            datetime                                 default CURRENT_TIMESTAMP not null,
    PRIMARY KEY (filename)
) charset = utf8;
