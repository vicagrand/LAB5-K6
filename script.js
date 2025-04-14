import http from "k6/http";
import { check, group, sleep } from "k6";

export let options = {
  vus: 10,
  duration: "15m",
};

export default function () {
  let res = http.get("https://example.com");

  group("Validations", () => {
    check(res, {
      "Status is 200": (r) => r.status === 200,
      "Response time < 500ms": (r) => r.timings.duration < 500,
      "Response body is not empty": (r) => r.body && r.body.length > 0,
      "Response includes <title>": (r) => r.body.includes("<title>"),
      "Content-Type is text/html": (r) =>
        r.headers["Content-Type"].includes("text/html"),
    });
  });

  group("Assertions (custom logic)", () => {
    if (res.status !== 200) {
      throw new Error("Request failed: status not 200");
    }

    if (!res.body.includes("<title>")) {
      throw new Error("No title tag found in HTML");
    }

    if (res.timings.duration > 2000) {
      throw new Error("Page load time exceeded 2 seconds");
    }

    if (!res.body.includes("Example Domain")) {
      throw new Error("Expected content not found");
    }

    if (
      !res.headers["Content-Length"] ||
      parseInt(res.headers["Content-Length"]) < 100
    ) {
      throw new Error("Content-Length is missing or too small");
    }
  });

  group("Correlations (Regex Extraction)", () => {
    // 1. Title tag content
    let title = res.body.match(/<title>(.*?)<\/title>/);
    if (title) console.log("Title: " + title[1]);

    // 2. Meta description tag content
    let meta = res.body.match(/<meta\s+name="description"\s+content="(.*?)"/i);
    if (meta) console.log("Description: " + meta[1]);

    // 3. Any link href
    let link = res.body.match(/<a\s+href="(.*?)"/i);
    if (link) console.log("First link: " + link[1]);

    // 4. Charset
    let charset = res.body.match(/charset=([a-zA-Z0-9-]+)/i);
    if (charset) console.log("Charset: " + charset[1]);

    // 5. H1 content
    let h1 = res.body.match(/<h1>(.*?)<\/h1>/i);
    if (h1) console.log("H1: " + h1[1]);
  });

  sleep(1);
}
