CREATE TABLE transactions
(
    id                   char(36)                                 not null,
    createdAt            datetime                                 default CURRENT_TIMESTAMP not null,
    updatedAt            datetime                                 default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP,
    PRIMARY KEY (id, createdAt)
) charset = utf8;
