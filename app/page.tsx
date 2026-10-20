import Hero from '@/components/Hero';
import Numbers from '@/components/Numbers';
import About from '@/components/About';
import WorkStage from '@/components/WorkStage';
import MoreWork from '@/components/MoreWork';
import Journey from '@/components/Journey';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import { HomeDirector } from '@/components/Director';

export default function Home() {
  return (
    <>
      <HomeDirector />
      <main>
        <Hero />
        <Numbers />
        <About />
        <WorkStage />
        <MoreWork />
        <Journey />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
