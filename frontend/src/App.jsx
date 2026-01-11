import { useState } from "react"
import axios from "axios";

function App() {

  const [originalUrl, setOriginalUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    try {
      const res = await axios.post('http://localhost:3000/api/short', { originalUrl });
      console.log("Response: ", res);
      setShortUrl(res.data);
      console.log(res.data);
    } catch(err) {
      console.error("Error in App.jsx: ", err);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 p-4'>
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 max-w-lg w-full">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 text-blue-600">URL Shortener</h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2 sm:space-y-4">
          <input 
            type="text" name="originalUrl" 
            placeholder="Enter your URL here"
            value={originalUrl}
            required
            onChange={(e) => setOriginalUrl(e.target.value)}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" />

          <button 
            type="submit" 
            className="bg-blue-600 text-white md:text-xl rounded-md p-2 font-semibold hover:bg-blue-700 transition">
              Shorten
          </button>
        </form>

          { shortUrl && (
            <div className="mt-6 text-center">
              <p className="text-gray-700 sm:text-lg md:text-xl font-medium">Shortened URL:</p>
              <a 
                href={shortUrl.shortUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 font-semibold text-sm sm:text-base md:text-lg hover:underline break-all">
                  {shortUrl.shortUrl}
              </a>

              {shortUrl && (
                <div className="mt-2 sm:mt-4">
                  <p className="text-gray-700 text-lg md:text-xl font-medium sm:mb-2">QR Code:</p>
                  <img src={shortUrl.qrCodeImg} alt="QR Code" className="mx-auto" />
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  )
}

export default App