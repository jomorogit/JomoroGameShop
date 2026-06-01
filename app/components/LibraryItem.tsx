export default function LibraryPageGameCreator() {
    return (
      <button className="w-80 mb-10 block hover:scale-105 transition-transform">
            <div 
                className="img h-80 rounded-t-lg bg-cover bg-center" 
                // style={{ backgroundImage: `url(${image})` }}
            ></div>
            <div className="p-3 bg-[#251642] rounded-b-lg text-white">
                {/* <p className="font-bold">{title}</p>
                <p className="text-sm">{formattedPrice}</p> */}
            </div>
      
      </button>
    );
}