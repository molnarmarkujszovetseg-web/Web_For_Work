@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

:: Ide menti a kódokat
set "OUTPUT=osszes_kod.txt"

:: Ha már létezik az előző fájl, töröljük, hogy ne fűzze hozzá a végtelenbe
if exist "%OUTPUT%" del "%OUTPUT%"

echo Kódok összegyűjtése a(z) %OUTPUT% fájlba...
echo.

:: Végigmegyünk a mappában lévő html, css és js fájlokon
for %%f in (*.html *.css *.js) do (
    echo Hozzáadva: %%f
    
    :: Szép, vizuális elválasztó generálása a fájlba
    echo =============================================================================== >> "%OUTPUT%"
    echo                       %%f >> "%OUTPUT%"
    echo =============================================================================== >> "%OUTPUT%"
    echo. >> "%OUTPUT%"
    
    :: A fájl tartalmának bemásolása
    type "%%f" >> "%OUTPUT%"
    
    :: Két üres sor a fájl vége után, hogy levegős legyen
    echo. >> "%OUTPUT%"
    echo. >> "%OUTPUT%"
)

echo.
echo KESZ! A kódjaid a(z) "%OUTPUT%" fájlban varakoznak.