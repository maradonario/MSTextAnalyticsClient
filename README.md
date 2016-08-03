# MSTextAnalyticsClient

1. Install node.js from here: [Node.JS 4.4.7 LTS](https://nodejs.org/en/)
2. clone project: 'git clone https://github.com/maradonario/MSTextAnalyticsClient.git'
3. Add a credentials.js file, should include the mongo db credentials and the cognitive API keys:
```
module.exports = {
    cognitiveServices : {
        user : 'usernamehere',
        key : 'keyhere'
    },
    mongo : {
        development : {
            connection : 'mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]'
        },
        production : {
            connection : 'mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]'
        }
    }
};
```
