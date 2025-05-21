const axios = require('axios');

async function consultarIA(prompt) {
    const response = await axios.post('http://ollama:11434/api/generate', {
        model: 'gemma',
        prompt,
        stream: false
    });
    return response.data.response;
}

module.exports = { consultarIA };
