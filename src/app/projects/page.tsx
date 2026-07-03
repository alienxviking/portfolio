"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// @ts-ignore
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/core";

import "@splidejs/react-splide/css";

const PROJECTS = [
  {
    id: 1,
    name: "Mind Palace OS",
    description: `A knowledge-visualization OS that turns notes into a living 3D neural grid. Built with Next.js, Three.js, and Supabase, it uses Google Gemini AI to auto-summarize, tag, and link your ideas.`,
    link: "https://mind-palace-rosy.vercel.app",
    images: [
      "/assets/projects-screenshots/mind-palace/1.png",
      "/assets/projects-screenshots/mind-palace/2.png",
      "/assets/projects-screenshots/mind-palace/3.png",
    ],
  },
  {
    id: 2,
    name: "Momentum",
    description: `A social accountability platform for building better habits. Track daily habits and streaks, submit progress reports, give peer feedback, and climb a real accountability leaderboard. Built with Next.js 16 and Supabase.`,
    link: "https://momentum-seven-flame.vercel.app",
    images: [
      "/assets/projects-screenshots/momentum/1.png",
      "/assets/projects-screenshots/momentum/2.png",
      "/assets/projects-screenshots/momentum/3.png",
      "/assets/projects-screenshots/momentum/4.png",
      "/assets/projects-screenshots/momentum/5.png",
      "/assets/projects-screenshots/momentum/6.png",
    ],
  },
  {
    id: 3,
    name: "Nexo Chat",
    description: `A real-time, premium 1-to-1 private messaging app built on WebSockets with a glassmorphism UI. Presence, read receipts, typing indicators, rich media, and message scheduling. Node.js + Socket.io + Prisma/PostgreSQL.`,
    link: "https://nexo-navy.vercel.app",
    images: [
      "/assets/projects-screenshots/nexo/1.png",
      "/assets/projects-screenshots/nexo/2.png",
      "/assets/projects-screenshots/nexo/3.png",
    ],
  },
  {
    id: 4,
    name: "Sift",
    description: `A multi-tenant document processing & hybrid search platform. Upload files and an async pipeline extracts text, runs OCR, and builds thumbnails, with live status over WebSockets. Postgres FTS + pgvector semantic search fused via RRF. FastAPI + Celery/Redis + Next.js, 100% free-tier.`,
    link: "https://sift-docprocess.vercel.app/",
    images: [
      "/assets/projects-screenshots/sift/1.png",
      "/assets/projects-screenshots/sift/2.png",
      "/assets/projects-screenshots/sift/3.png",
      "/assets/projects-screenshots/sift/4.png",
    ],
  },
  {
    id: 5,
    name: "Chess Game",
    description: `A smooth chess experience having both the option to play local multiplayer as well as against ai. Stockfish API was used to set 3 difficulty levels.`,
    link: "https://github.com/alienxviking/chess-pygame",
    images: [
      "/assets/projects-screenshots/chess/1.png",
      "/assets/projects-screenshots/chess/2.png",
      "/assets/projects-screenshots/chess/3.png",

    ],
  },
  {
    id: 6,
    name: "cook.io",
    description: `A recipe finding website that allows users to search for recipes by name, ingredients, or cuisine. Built using HTML, CSS, and Vanilla JavaScript. This was my first project after learning JavaScript.`,
    link: "https://alienxviking.github.io/cookio/",
    images: [
      "/assets/projects-screenshots/cook.io/1.png",
      "/assets/projects-screenshots/cook.io/2.png",
      "/assets/projects-screenshots/cook.io/3.png",
      "/assets/projects-screenshots/cook.io/4.png",
    ],
  },
];
function Page() {
  return (
    <>
      <div className="container mx-auto md:px-[50px] xl:px-[150px] text-zinc-300 h-full">
        <h1 className="text-4xl mt-[100px] mb-[50px]">Projects</h1>
        <ul className="grid  md:grid-cols-2 lg:grid-cols-3 gap-10 place-content-around ">
          {PROJECTS.map((project) => (
            <li
              className="w-[300px] h-[400px] border-[.5px] rounded-md border-zinc-600"
              key={project.id}
              style={{ backdropFilter: "blur(2px)" }}
            >
              <div className="h-[200px]">
                <Splide
                  options={{
                    type: "loop",
                    interval: 3000,
                    autoplay: true,
                    speed: 2000,
                    perMove: 1,
                    rewind: true,
                    easing: "cubic-bezier(0.25, 1, 0.5, 1)",
                    arrows: false,
                  }}
                  aria-label="My Favorite Images"
                >
                  {project.images.map((image) => (
                    <SplideSlide key={image}>
                      <Image
                        src={image}
                        alt={`screenshot of "${project.name}`}
                        className="w-[300px] h-[200px] rounded-md bg-zinc-900 "
                        width={300}
                        height={400}
                        style={{ height: "200px" }}
                      />
                    </SplideSlide>
                  ))}
                </Splide>
              </div>
              <div className="p-4 text-zinc-300">
                <h2 className="text-xl">{project.name}</h2>
                <p className="mt-2 text-xs text-zinc-500">
                  {project.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Page;
