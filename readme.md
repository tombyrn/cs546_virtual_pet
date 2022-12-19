CS-546 Web Development Final Project

Installation Guide:

1. Install node packages by running
    ```
    npm i
    ```
2. Run mongodb database in terminal
    ```
    mongod --dbpath /path/to/store/db/files
    ```
3. In serparate terminal process start the web server
    ```
    npm start
    ```
4. (optional) Seed the database in another terminal process
    ```
    npm run seed
    ```
5. You can now login/register and create a pet!