const fs = require("fs")
const path = require("path")
const faker = require(`faker`)

console.log("Start of gen")

const N = parseInt(process.env.N, 10) || 100
const FILE = path.resolve("gendata.csv")

console.log("Now generating " + N + " articles into", FILE)
fs.writeFileSync(FILE, "articleNumber,title,description,slug,date,tags,body\n")

function createArticle(n) {
  const title = faker.lorem.sentence()
  const slug = faker.helpers.slugify(title).toLowerCase()
  const desc = faker.lorem.sentence()
  const date = faker.date.recent(1000).toISOString().slice(0, 10)
  const tags = faker.random
    .words(3)
    .split(` `)
    .map(w => `"${w}"`)
    .join(`, `)
  fs.appendFileSync(
    FILE,
    [
      // 'a','b','c','d','e','f', 'g'
      String(n),
      title,
      desc,
      slug,
      date,
      tags,
      `
<h1>${title}</h1>
<blockquote>${desc}</blockquote>
<p>${faker.lorem.paragraphs(1)}</p>
<p>${faker.lorem.paragraphs(1)}</p>
      `,
    ]
      .map(s =>
        s
          .trim()
          // Need to escape newlines and commas
          .replace(/,/g, "\\,")
          .replace(/\n/g, "") // html don't care about newlines
      )
      .join(",") + "\n"
  )
}

for (let i = 0; i < N; ++i) {
  createArticle(i)
}

console.log("Finished generating " + N + " articles into", FILE)
console.log("End of gen")
