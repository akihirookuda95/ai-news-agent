import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { z } from "zod";
import { get } from "node:http";


// ダミーツール
const getWeather = tool(
  async ({ city }) => `The weather in the ${city} is sunny.`,
  {
    name: "getWeather",
    description: "Get the weather in a city.",
    schema: z.object({
      city: z.string().describe("name of the city"),
    }),
  }
);

const tools = [getWeather];
const toolNode = new ToolNode(tools);


// モデル定義
const model = new ChatAnthropic({
  model: "claude-haiku-4-5-20251001",
  temperature: 0,
}).bindTools(tools); // LLMに対してツールの一覧を登録する


// エッジの条件分岐: ツールを呼ぶか終了するかを判定
function shouldContinue({ messages }: typeof MessagesAnnotation.State ) {
  const lastMessage = messages[messages.length - 1] as AIMessage;
}























