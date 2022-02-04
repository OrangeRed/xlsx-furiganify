import { tokenize, toHiragana, isKana } from "wanakana"

const furiganify = (kanji: string, kana: string) => {
  let remainingKana = kana
  const stringTokens = tokenize(kanji)

  for (const [i, token] of stringTokens.entries()) {
    if (i >= 1 && isKana(token)) {
      // Split kana string into pieces based on where the token appears,
      const splitKana = remainingKana.split(toHiragana(token))

      // Give first piece of split kana string to the previous token
      // If the first piece of split kana doesn't exist,
      // Make furigana equal to the Token + second piece
      const frontKana = splitKana.shift()
      const furigana = frontKana ? frontKana : token + splitKana.shift()

      // Add furigana in brackets to the stringToken
      stringTokens[i - 1] = `${stringTokens[i - 1]}[${furigana}]`

      // Make kana string equal to the remaining split kana
      remainingKana = splitKana.join("")

      // For the last token add remaining kana to it
    } else if (stringTokens.slice(-1)[0] == token) {
      stringTokens[i] = `${stringTokens[i]}[${remainingKana}]`
    }
  }

  // Recombine all tokens
  return kanji ? stringTokens.join("") : kana
}

export default furiganify
