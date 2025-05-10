const express = require("express");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

const commands = {
  chrome: {
    start: (url) => `start chrome "${url}"`, // url as argumenmt
    stop: "taskkill /F /IM chrome.exe", // window commands
    cleanup: 'rmdir /s /q "%LocalAppData%\\Google\\Chrome\\User Data"', //  path
    geturl: `powershell -command "& {Get-Process chrome | Where-Object {$_.MainWindowTitle} | Select-Object MainWindowTitle}"`,
  },
  firefox: {
    start: (url) => `start firefox "${url}"`,
    stop: "taskkill /F /IM firefox.exe",
    cleanup: ` rmdir /s /q "%AppData%\\Mozilla\\Firefox\\Profiles\\*.default\\*"`,
    geturl: `powershell -command "& {Get-Process firefox | Where-Object {$_.MainWindowTitle} | Select-Object MainWindowTitle}"`
}

};

app.get("/start", (req, res) => {
  const { browser, url = "https://www.browserstack.com/" } = req.query;

  if (!commands[browser])
    return res.status(400).json({ error: "Invalid browser" });

  exec(commands[browser].start(url), (err) => {
    if (err)
      return res
        .status(500)
        .json({ error: `Failed to open ${url} in ${browser}` });
    res.json({ message: `${browser} started with ${url}` });
  });
});

app.get("/stop", (req, res) => {
  const { browser } = req.query;
  if (!commands[browser])
    return res.status(400).json({ error: "Invalid browser" });

  exec(commands[browser].stop, (err) => {
    if (err)
      return res.status(500).json({ error: `Failed to stop ${browser}` });
    res.json({ message: `${browser} stopped` });
  });
});

app.get("/cleanup", (req, res) => {
  const { browser } = req.query;
  if (!commands[browser])
    return res.status(400).json({ error: "Invalid browser" });

  exec(commands[browser].cleanup, (err) => {
    if (err)
      return res.status(500).json({ error: `Failed to clean up ${browser}` });
    res.json({ message: `${browser} cleaned up` });
  });
});

app.get("/geturl", (req, res) => {
  const { browser } = req.query;
  if (!commands[browser])
    return res.status(400).json({ error: "Invalid browser" });

  exec(commands[browser].geturl, (err, stdout) => {
    if (err)
      return res
        .status(500)
        .json({ error: `Failed to get URL from ${browser}` });

    const url = stdout
      .trim()
      .split("\n")
      .find((line) => line.trim());

    if (!url)
      return res
        .status(404)
        .json({ error: `No active tab found in ${browser}` });

    res.json({ activeTabUrl: url });
  });
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

// http://localhost:3000/start?browser=chrome
// http://localhost:3000/geturl?browser=chrome
// http://localhost:3000/stop?browser=chrome
// http://localhost:3000/cleanup?browser=chrome


// http://localhost:3000/start?browser=firefox
// http://localhost:3000/geturl?browser=firefox
// http://localhost:3000/stop?browser=firefox
// 
