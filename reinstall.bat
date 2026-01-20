@echo off
echo ========================================
echo   REINSTALACAO LIMPA - SERCAMP
echo ========================================
echo.
echo ATENCAO: Isso vai deletar node_modules e reinstalar tudo!
echo O banco de dados PostgreSQL NAO sera afetado.
echo.
pause

echo.
echo [1/5] Limpando node_modules e lock files...
echo.

REM Raiz
if exist node_modules rmdir /s /q node_modules
if exist bun.lockb del bun.lockb

REM Backend
cd backend
if exist node_modules rmdir /s /q node_modules
if exist .prisma rmdir /s /q .prisma
if exist bun.lockb del bun.lockb
cd ..

REM Frontend
cd frontend
if exist node_modules rmdir /s /q node_modules
if exist .svelte-kit rmdir /s /q .svelte-kit
if exist bun.lockb del bun.lockb
cd ..

echo.
echo [2/5] Instalando dependencias da raiz...
echo.
call bun install

echo.
echo [3/5] Instalando dependencias do backend...
echo.
cd backend
call bun install

echo.
echo [4/5] Gerando Prisma Client...
echo.
call bun prisma generate

echo.
echo Sincronizando schema com banco de dados...
call bun prisma db push
cd ..

echo.
echo [5/5] Instalando dependencias do frontend...
echo.
cd frontend
call bun install
cd ..

echo.
echo ========================================
echo   REINSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Proximos passos:
echo   1. Rodar: bun run dev
echo   2. Acessar: http://localhost:5173
echo.
echo Versoes instaladas:
cd backend
echo Backend:
call bun pm ls | findstr "express prisma"
cd ..
cd frontend
echo.
echo Frontend:
call bun pm ls | findstr "svelte vite tailwind"
cd ..
echo.
pause
