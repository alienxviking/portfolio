import Hero from '@/components/Hero';
import Numbers from '@/components/Numbers';
import WorkStage from '@/components/WorkStage';
import MoreWork from '@/components/MoreWork';
import About from '@/components/About';
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
        <WorkStage />
        <MoreWork />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
