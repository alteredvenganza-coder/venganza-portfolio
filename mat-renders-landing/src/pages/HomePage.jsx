import NoiseOverlay from '../components/NoiseOverlay';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Philosophy from '../components/Philosophy';
import Protocol from '../components/Protocol';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      <NoiseOverlay />
      <Header />
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Protocol />
      </main>
      <Footer />
    </>
  );
}
