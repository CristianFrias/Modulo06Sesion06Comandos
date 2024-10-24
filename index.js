// DEPENDENCIA QUE NOS PERMITE TENER CARACTERES UNICOS
const { v4: uuidv4 } = require('uuid');
// PARA LA CREACION DE COMANDOS
const yargs = require("yargs")
// COLORES DENTRO DE LA CONSOLA
const clc = require("cli-color");
// LEERY ESCRIBIR ARCHIVOS
const { readFileSync, writeFileSync } = require("fs")

yargs
    // INICIO COMANDO SALUDAR
    .command(
        "saludar",
        "Comando utilizado para saludar recibiendo el nombre y apellido",
        {
            nombre: {
                alias: "n",
                describe: "Nombre para el saludo",
                demandOption: true,
                type: "string"
            },
            apellido: {
                alias: "a",
                describe: "Apellido para el saludo",
                demandOption: true,
                type: "string"
            }
        },
        ({nombre, apellido}) => {
            console.log(`Hola, bienvenido(a) ${nombre} ${apellido}`);
        }
    )
    // FIN COMANDO SALUDAR
    // INICIO COMANDO CREAR
    .command(
        "crear",
        "Comando para registrar personas",
        {
            rut_dv: {
                alias: "rd",
                describe: "Dígito verificador del RUT de la persona a registrar",
                demandOption: true,
                type: "string"
            },
            rut_numero: {
                alias: "rn",
                describe: "Parte numérica del RUT de la persona a registrar",
                demandOption: true,
                type: "number"
            },
            nombre: {
                alias: "n",
                describe: "Nombre para el saludo",
                demandOption: true,
                type: "string"
            },
            apellido: {
                alias: "a",
                describe: "Apellido para el saludo",
                demandOption: true,
                type: "string"
            }
        },
        (arguments) => {
            const id = uuidv4();
            const { rut_dv, rut_numero, nombre, apellido } = arguments
            const persona = {
                id,
                rut_dv,
                rut_numero,
                nombre,
                apellido
            }
            // CONVIERTE EN OBJETO
            const contentString = readFileSync(`${__dirname}/files/personas.txt`,"utf-8")
            const contentJS = JSON.parse(contentString)

            const busqueda = contentJS.some(item => item.rut_dv == rut_dv && item.rut_numero == rut_numero)
            if (busqueda) {
                return console.log(clc.red("RUT registrado previamente, por favor ingresar los datos de otra persona"));
                
            }

            contentJS.push(persona)

            writeFileSync(`${__dirname}/files/personas.txt`,JSON.stringify(contentJS),"utf-8")

            console.log(clc.green("Registro de persona exitoso"));
            
        }
    )
    // FIN COMANDO CREAR
    // INICIO COMANDO LISTAR
    .command(
        "listar",
        "Comando para mostrar la lista de personas registradas",
        {},
        () => {
            const contentString = readFileSync(`${__dirname}/files/personas.txt`, "utf-8")
            const contentJS = JSON.parse(contentString) // pasa de json a string
            contentJS.sort((a, b) => Number(a.rut_numero) - Number(b.rut_numero))
            // ESPECIFICAMOS LOS ELEMENTOS QUE QUEREMOS A MOSTRAR
            const response = contentJS.map( item => {
                return {
                    id: item.id,
                    rut: `${item.rut_numero}-${item.rut_dv}`,
                    nombre: item.nombre,
                    edad:20
                }
            })
            console.table(response)
            
        }
    )
    // FIN COMANDO LISTAR

    // JUEVES 17 DE OCTUBRE
    // INICIO COMANDO MODIFICAR
    .command(
        "modificar",
        "Comando utilizado para modificar los datos de una persona registrada",
        {
            // EN ESTE CASO ID ES EL UNICO TRUE POR QUE ES EL UNICO QUE PEDIRÁ
            id: {
                alias: "i",
                describe: "Identificación única de la persona a modificar",
                demandOption: true,
                type: "string"
            },
            rut_dv: {
                alias: "rd",
                describe: "Dígito verificador del RUT de la persona a registrar",
                demandOption: false,
                type: "string"
            },
            rut_numero: {
                alias: "rn",
                describe: "Parte numérica del RUT de la persona a registrar",
                demandOption: false,
                type: "number"
            },
            nombre: {
                alias: "n",
                describe: "Nombre para el saludo",
                demandOption: false,
                type: "string"
            },
            apellido: {
                alias: "a",
                describe: "Apellido para el saludo",
                demandOption: false,
                type: "string"
            }
        },
        ({id, rut_dv, rut_numero, nombre, apellido}) => {
            console.table({id, rut_dv, rut_numero, nombre, apellido});
            // VALIDACION
            if(rut_dv == undefined && rut_numero == undefined && nombre == undefined && apellido == undefined){
                return console.table(clc.yellow("Por favor enviar al menos un atributo a modificar"))
            }

            const contentString = readFileSync(`${__dirname}/files/personas.txt`, "utf-8");
            const contentJS = JSON.parse(contentString);
         
            const busqueda = contentJS.find( item => item.id == id)

            if(busqueda == undefined) {
                return console.log(clc.red("ID de persona no registrada, por favor corregir"));
                
            }

            // TERNARIO
            busqueda.nombre = nombre != undefined ? nombre : busqueda.nombre
            busqueda.apellido = apellido != undefined ? apellido : busqueda.apellido
            busqueda.rut_dv = rut_dv != undefined ? rut_dv : busqueda.rut_dv
            busqueda.rut_numero = rut_numero != undefined ? rut_numero : busqueda.rut_numero
            // busqueda.rut_dv &&= rut_dv;
            // busqueda.rut_numero &&= rut_numero;

            writeFileSync(`${__dirname}/files/personas.txt`, JSON.stringify(contentJS), "utf-8")

            // console.log(contentJS);
            console.log(clc.green("Persona modificada con éxito"))
        }
    )
    .command(
        "eliminar",
        "Comando para eliminar personas registradas",
        {
            id: {
                alias: "i",
                describe: "ID utilizado como referencia para eliminar una persona",
                demandOption: true,
                type: "string"
            }
        },
        ({id}) => {
            const contentString = readFileSync(`${__dirname}/files/personas.txt`, "utf-8");
            const contentJS = JSON.parse(contentString);

            const indice = contentJS.findIndex(item => item.id == id)

            if(indice == -1){
                return console.log(clc.red("Está intentando eliminar una persona con un ID no resgistrado"));
            }

            contentJS.splice(indice, 1)
            writeFileSync(`${__dirname}/files/personas.txt`, JSON.stringify(contentJS), "utf-8");
            console.log(clc.red("Persona eliminada con éxito"));
            
        }
    )
    .help().argv