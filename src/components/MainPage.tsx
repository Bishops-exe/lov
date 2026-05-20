import Upload from "./Upload.tsx";
import SampleData from "./SampleData.tsx";
import _twe from "react-twemoji"

const Twemoji = (_twe as unknown as { default: typeof _twe }).default;

export default function MainPage({onBytesReceived}: {
  onBytesReceived: () => void
}) {

  return <div className="h-full w-full min-h-full flex flex-col">
    <main className="flex flex-col gap-8 p-8 items-center *:w-full flex-1">
      <div className="flex sm:flex-row flex-col gap-8 justify-around items-center *:flex-1">
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-baseline">
            <h1 className="text-center m-0 text-4xl md:text-5xl lg:text-6xl">Lov</h1>
            <span><i><b>L</b>arge <b>o</b>bject <b>v</b>iewer</i></span>
          </div>

          <ul>
            <li><span>uses virtualization to hide offscreen elements.</span></li>
            <li><span>rust to speed up parsing and rendering.</span></li>
          </ul>

        </div>

        <div className="aspect-2/1! w-full h-full">
          <Upload onBytesReceived={onBytesReceived}/>
        </div>
      </div>
      <div className="flex sm:flex-row-reverse flex-col gap-8 justify-around items-center *:flex-1">
        <div className="flex flex-col gap-2">
          <h2 className="m-0">Got no data?</h2>
          <span>Try out these samples! Hosted by <a className="link text-inherit"
                                                    href="https://jsonplaceholder.typicode.com/">the json placeholder api</a></span>
        </div>
        <div
            className="flex flex-wrap gap-2 *:flex-1 *:basis-1/3 *:m-0">
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/posts" name="posts"/>
          </div>
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/comments" name="comments"/>
          </div>
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/albums" name="albums"/>
          </div>
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/users" name="users"/>
          </div>
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/photos" name="photos"/>
          </div>
          <div>
            <SampleData url="https://jsonplaceholder.typicode.com/todos" name="todos"/>
          </div>
        </div>
      </div>
    </main>
    <footer
        className="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10 border-t-(--color-base-300) border-t-2">
      <Twemoji options={{className: "h-[1em]"}}>
        <p>
          Made with ❤️ in 🇮🇹 by Bishops-exe. Consider <a className="link text-inherit" target="_blank" href="https://github.com/bishops-exe/lov/#Supporting">supporting</a> us!
        </p>
      </Twemoji>


    </footer>
  </div>
}