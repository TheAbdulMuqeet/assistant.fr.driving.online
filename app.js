import OpenAI from "openai";
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url'

const PORT = process.env.PORT || 3000;
const getDirName = function (moduleUrl) {
    const filename = fileURLToPath(moduleUrl)
    return path.dirname(filename)
}

const __filename = getDirName(import.meta.url)
const __dirname = path.dirname(__filename + '/app');
const app = express()

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(path.join(__dirname)));
app.get('/testing', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
});

const openai = new OpenAI({
    apiKey: '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'
})

const assistant = await openai.beta.assistants.retrieve('asst_OXV4w0ChDCabvru36eQobjnR');
const thread = await openai.beta.threads.create();


app.post('/endpoint', async function (req, res) {
    let userInput = req.body.userInput;
    let main_message = await openai.beta.threads.messages.create(
        thread.id,
        {
            role: "user",
            content: userInput
        }
    )

    let run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: assistant.id
        })

    let current_run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    while (current_run['status'] != 'completed') {
        current_run = await openai.beta.threads.runs.retrieve(thread.id, run.id)
    }

    let messages = await openai.beta.threads.messages.list(thread.id)
    res.send(messages.body.data[0].content[0].text.value);
});

app.listen(PORT, () => { console.log("running"); })
