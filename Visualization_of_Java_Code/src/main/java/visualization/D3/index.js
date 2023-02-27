import express, { Router } from "express"
import { readFileSync } from "fs";
import { readFile } from "fs/promises";
import path from "path"


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

app.get("/data", async function(request, response){
    const associations = await readFile(path.join(__dirname, "public/src/data/assocs.json"), "utf-8")
    const entities = await readFile(path.join(__dirname, "public/src/data/entities.json"), "utf-8")

    // console.log("associations", associations)
    response.send({associations, entities})
})


const port =  3002

app.listen(port, () => {
    console.log('Serving IVJC on', port)
})
