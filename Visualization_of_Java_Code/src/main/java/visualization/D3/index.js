import express, { Router } from "express"
import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path"
import argvParser from 'process.argv'


const app = express()
const moduleURL = new URL(import.meta.url);
// console.log(`pathname ${moduleURL.pathname}`);
// console.log(`dirname ${path.dirname(moduleURL.pathname)}`);
const __dirname = path.dirname(moduleURL.pathname).slice(1)
console.log("dirname", __dirname)

// app.use(express.static(path.join(__dirname, '')));
app.use(express.static('public'))
app.use(express.static('node_modules'))
// app.get('*', function (req, res) {
//     res.sendFile(__dirname + '/index.html')
// //   res.sendFile(path.join("C:/Users/semme/Desktop/InteractiveVisualizationOfJavaCode/Visualization_of_Java_Code/src/main/java/visualization/D3/", 'index.html'))
// })


const dir = path.join(__dirname)
const _path = (dir.charAt(0) !== '/' ? '/' + dir : dir) + '/'

app.get("/data", async function (request, response) {
    const associations = await readFile(_path + "public/src/data/assocs.json", "utf-8")
    const entities = await readFile(_path + "public/src/data/entities.json", "utf-8")

    // console.log("associations", associations)
    response.send({ associations, entities })
})



const args = argvParser(process.argv.slice(2))
const config = args({})

console.log(config)

if (config.help) {
    console.log('HELP:\n--collapse - collapse all nodes at on init\n--disable - disable all types on init\n--disable=[classes,methods,constructors,parameters,attributes,localVariables] - disable specific types on init (comma separated list without spaces)')
    process.exit(1)
}

const { collapse, disable } = config
app.get('/config', async function (request, response) {
    response.send({ collapse, disable })
})


const port = 3002

app.listen(port, () => {
    console.log('Serving IVJC on', port)
})
