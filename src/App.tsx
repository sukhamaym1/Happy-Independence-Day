import { useState, useEffect, useMemo, type FormEvent, type MouseEvent } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Share2, Link, Sparkles, Volume2, VolumeX, Download } from 'lucide-react';
import { toggleAudio, initAudioOnFirstInteraction } from './audio';

const AshokaChakra = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={`text-[#000080] ${className}`} fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="50" cy="50" r="45" strokeWidth="4" />
    <circle cx="50" cy="50" r="10" fill="currentColor" />
    {[...Array(24)].map((_, i) => (
      <line
        key={i}
        x1="50"
        y1="50"
        x2={50 + 45 * Math.cos((i * 15 * Math.PI) / 180)}
        y2={50 + 45 * Math.sin((i * 15 * Math.PI) / 180)}
      />
    ))}
  </svg>
);

function FloatingElements() {
  const [mounted, setMounted] = useState(false);
  
  const particles = useMemo(() => {
    return [...Array(30)].map((_, i) => {
      const isSaffron = i % 3 === 0;
      const isGreen = i % 3 === 1;
      const colorClass = isSaffron ? 'bg-[#FF9933]' : isGreen ? 'bg-[#138808]' : 'bg-white';
      const size = 10 + Math.random() * 15;
      const left = `${Math.random() * 100}%`;
      const swayAmount = (Math.random() * 60) + 20;
      const swayDuration = 3 + Math.random() * 4;
      const riseDuration = 15 + Math.random() * 15;
      const delay = Math.random() * 10;
      return { id: i, colorClass, size, left, swayAmount, swayDuration, riseDuration, delay };
    });
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full opacity-30 ${p.colorClass}`}
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: '110%',
          }}
          animate={{ 
            y: ['0vh', '-120vh'],
            x: [0, p.swayAmount, -p.swayAmount, 0],
          }}
          transition={{
            y: {
              duration: p.riseDuration,
              repeat: Infinity,
              ease: 'linear',
              delay: p.delay
            },
            x: {
              duration: p.swayDuration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: p.delay
            }
          }}
        />
      ))}
    </div>
  );
}

const encodeName = (str: string) => {
  try {
    return btoa(encodeURIComponent(str));
  } catch (e) {
    return encodeURIComponent(str);
  }
};

const decodeName = (str: string) => {
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    return decodeURIComponent(str);
  }
};

export default function App() {
  const [senderName, setSenderName] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        const playing = initAudioOnFirstInteraction();
        setIsMuted(!playing);
      }
    };

    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nameParam = params.get('n');
    if (nameParam) {
      setSenderName(decodeName(nameParam));
      setTimeout(triggerConfetti, 500);
    } else {
      setShowForm(true);
    }
  }, []);

  const triggerConfetti = () => {
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FF9933', '#FFFFFF', '#138808']
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF9933', '#FFFFFF', '#138808']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleGenerate = (e: FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    
    const encodedName = encodeName(userName.trim());
    const url = `${window.location.origin}${window.location.pathname}?n=${encodedName}`;
    setGeneratedUrl(url);
    triggerConfetti();
  };

  const handleWhatsAppShare = () => {
    if (!generatedUrl) return;
    const sender = userName.trim() || 'Someone';
    const text = `🇮🇳 *Happy 80th Independence Day!* 🇮🇳\n\n${sender} has sent you a special patriotic greeting. Open this link to see your surprise: 👇\n\n${generatedUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleMute = (e: MouseEvent) => {
    e.stopPropagation();
    const playing = toggleAudio();
    setIsMuted(!playing);
    setHasInteracted(true);
  };

  const handleDownloadCertificate = () => {
    const printName = senderName || userName;
    if (!printName) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = './certificate.png'; // Users need to place certificate.png in public folder

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw the name over the certificate
      ctx.fillStyle = '#000080';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const name = printName.toUpperCase();
      let fontSize = 68;
      ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
      
      const maxWidth = canvas.width * 0.365;
      while (ctx.measureText(name).width > maxWidth && fontSize > 38) {
        fontSize -= 1;
        ctx.font = `bold ${fontSize}px Georgia, "Times New Roman", serif`;
      }
      
      const x = canvas.width / 2;
      const y = canvas.height * 0.462;
      
      ctx.fillText(name, x, y);

      const link = document.createElement('a');
      link.download = `${printName}-Independence-Day-Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.onerror = () => {
      // Fallback programmatic certificate if image is missing
      canvas.width = 1200;
      canvas.height = 800;
      
      ctx.fillStyle = '#fffdf5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#FF9933';
      ctx.lineWidth = 20;
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
      
      ctx.strokeStyle = '#138808';
      ctx.lineWidth = 10;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      ctx.fillStyle = '#FF9933';
      ctx.font = 'bold 60px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HAPPY 80TH INDEPENDENCE DAY', canvas.width / 2, 150);
      
      ctx.fillStyle = '#000080';
      ctx.font = 'bold 50px serif';
      ctx.fillText('CERTIFICATE OF APPRECIATION', canvas.width / 2, 250);

      ctx.fillStyle = '#333';
      ctx.font = '30px sans-serif';
      ctx.fillText('This certificate is proudly presented to', canvas.width / 2, 350);

      ctx.fillStyle = '#000080';
      ctx.font = 'bold 80px serif';
      ctx.fillText(printName.toUpperCase(), canvas.width / 2, 450);

      ctx.beginPath();
      ctx.moveTo(300, 480);
      ctx.lineTo(900, 480);
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#333';
      ctx.font = '24px sans-serif';
      ctx.fillText('in recognition of your awareness, love and contribution', canvas.width / 2, 530);
      ctx.fillText('towards our Nation.', canvas.width / 2, 570);

      const link = document.createElement('a');
      link.download = `${printName}-Independence-Day-Certificate.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="min-h-screen animate-wave-bg bg-gradient-to-br from-[#FF9933] via-white to-[#138808] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <FloatingElements />
      
      <button 
        onClick={handleToggleMute}
        className="absolute top-6 right-6 z-50 p-3 bg-white/30 backdrop-blur-md rounded-full text-blue-900 hover:bg-white/50 transition-colors shadow-lg border border-white/40"
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
        className="max-w-md w-full shadow-2xl rounded-3xl p-8 text-center border border-white/60 relative z-10 overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.95)), url("https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-30">
          <div className="flex justify-center mb-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-[#FF9933]/40 to-[#138808]/40 rounded-full blur-xl" />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <AshokaChakra className="w-24 h-24 drop-shadow-md" />
            </motion.div>
          </div>

        {senderName ? (
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-medium text-gray-500 uppercase tracking-widest mb-2">A Special Greeting</h2>
              <div className="py-5 px-4 rounded-2xl bg-gradient-to-br from-orange-50 to-green-50 border border-gray-100 shadow-inner">
                <p className="text-sm text-gray-500 font-medium mb-1">From</p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] leading-tight">
                  {senderName}
                </p>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-3xl font-black tracking-tight drop-shadow-sm"
            >
              <span className="text-[#FF9933]">Happy 80th</span>{" "}
              <span className="text-[#000080]">Independence</span>{" "}
              <span className="text-[#138808]">Day</span>
              <span className="block text-2xl text-[#FF9933] mt-1">2026</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-6 px-2"
            >
              <p className="text-[15px] text-gray-700 font-medium italic leading-relaxed">
                "May the tricolor always fly high and our hearts swell with pride. Let us honor the sacrifices of our brave heroes and build a brighter, united India together. Jai Hind! 🇮🇳"
              </p>
            </motion.div>
            
            {!showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-8 space-y-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowForm(true)}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#000080] to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-blue-200" />
                  Create Your Own Greeting
                </motion.button>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h1 className="text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
              <span className="text-[#FF9933]">Happy 80th</span> <br/> 
              <span className="text-[#000080]">Independence</span> <br/> 
              <span className="text-[#138808]">Day</span> <br/> 
              <span className="text-3xl text-[#FF9933]">2026</span>
            </h1>
            <p className="text-gray-600 font-medium">
              Create a beautiful personalized greeting to share with your friends and family.
            </p>
          </div>
        )}

        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.4 }}
            className="mt-8 pt-8 border-t border-gray-100"
          >
            {!generatedUrl ? (
              <form onSubmit={handleGenerate} className="space-y-5">
                <div className="text-left">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Enter Your Name</label>
                  <input
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#FF9933] focus:border-[#FF9933] transition-all outline-none text-lg font-bold text-gray-800 placeholder:text-gray-400 placeholder:font-normal shadow-inner"
                    required
                    maxLength={40}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#FF9933] to-[#138808] text-white font-bold text-lg rounded-xl shadow-lg shadow-orange-500/20"
                >
                  Generate Link
                </motion.button>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="p-5 bg-green-50 text-[#138808] rounded-xl font-bold border border-green-200 shadow-sm flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Your greeting is ready! 
                </div>
                
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsAppShare}
                    className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-lg rounded-xl shadow-lg shadow-green-600/20 flex items-center justify-center gap-3 transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                    Share on WhatsApp
                  </motion.button>

                  <button
                    onClick={copyToClipboard}
                    className="w-full py-4 px-6 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors active:bg-gray-100"
                  >
                    <Link className="w-5 h-5 text-gray-400" />
                    {copied ? 'Link Copied!' : 'Copy Link'}
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownloadCertificate}
                    className="w-full py-4 px-6 bg-white text-[#000080] border-2 border-[#000080] font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Certificate
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        </div>
      </motion.div>

      <motion.a
        href="https://whatsapp.com/channel/0029Vb5zRopEFeXetLMbKn1L"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-5 max-w-md w-full bg-white/95 backdrop-blur-xl shadow-xl rounded-2xl p-4 border border-white/60 flex items-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all z-10 overflow-hidden relative group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="flex-shrink-0 w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center relative z-10">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#25D366]">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0 relative z-10">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Join our community</p>
          <p className="text-gray-900 font-bold truncate text-base">Free Career Notice</p>
        </div>
        <div className="relative z-10 shrink-0">
          <span className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-colors">
            Join Now
          </span>
        </div>
      </motion.a>
      
      <p className="mt-8 text-white font-medium text-sm text-center drop-shadow-md z-10">
        Celebrate the spirit of freedom. <br /> 
        <span className="opacity-90">15th August 2026</span>
      </p>
    </div>
  );
}
