// 테스트(Node)에서 컴포넌트가 import하는 .css 파일을 빈 모듈로 처리한다.
// Next.js는 빌드 시 CSS를 처리하지만, tsx로 컴포넌트를 직접 렌더링할 때는 Node가 CSS를 읽지 못한다.
import Module from "node:module";

const extensions = (Module as unknown as { _extensions: Record<string, (module: { exports: unknown }) => void> })._extensions;
if (extensions && !extensions[".css"]) {
  extensions[".css"] = (module) => {
    module.exports = {};
  };
}
