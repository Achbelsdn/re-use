"use client";
import sharedStyles from "../page-shared.module.css";
import styles from "./docs.module.css";
import FooterSection from "@/components/sections/FooterSection";
import { useEffect, useState } from "react";
import Link from "next/link";

const sections = [
  {
    id: "comment-ca-marche",
    emoji: "🔄",
    title: "Comment ca marche ?",
    body: `Re-Use est une marketplace de composants UI/UX. Tu trouves un composant, tu l'achetes, et tu recois le code source dans ta boite mail.

    Les etapes :
    1. Parcourir les templates sur la page Templates.
    2. Cliquer sur un composant pour voir l'apercu et le prix.
    3. Entrer ton email, payer (ou pas si gratuit), et recevoir le ZIP.`
  },
  {
    id: "composants-gratuits",
    emoji: "📥",
    title: "Telecharger un composant gratuit",
    body: `Les composants tags Gratuit sont accessibles sans payer.

    1. Clique sur le composant voulu depuis la page Templates.
    2. La modale s'ouvre, clique sur "Obtenir Gratuitement".
    3. Entre ton adresse email et clique sur "Envoyer le lien par email".
    4. Tu recevras un email avec le lien de telechargement ZIP dans les secondes qui suivent.

    Le lien de telechargement est valide pendant 24 heures. Sauvegarde ton fichier des que tu le recois !`
  },
  {
    id: "composants-pro",
    emoji: "💳",
    title: "Acheter un composant Pro",
    body: `Les composants tags Pro necessitent un paiement unique via FedaPay (Carte bancaire, Mobile Money, etc.)

    1. Clique sur le composant depuis la page Templates.
    2. Clique sur "Telecharger pour X FCFA".
    3. Entre ton adresse email.
    4. Tu seras redirige vers la page de paiement FedaPay.
    5. Une fois le paiement valide, le telechargement demarre automatiquement.
    6. Un email avec le lien est egalement envoye.

    Si tu n'as pas recu l'email apres 5 minutes, verifie tes spams.`
  },
  {
    id: "abonnement",
    emoji: "👑",
    title: "L'Abonnement Acces Illimite ($29/mois)",
    body: `L'abonnement te donne acces a TOUS les composants Pro sans payer a l'unite.

    Avantages :
    - Acces a tous les templates et composants Pro
    - Nouveaux composants chaque semaine
    - Licence commerciale incluse
    - Support prioritaire par email

    Comment utiliser mon abonnement ?
    1. Souscris sur la page Tarifs.
    2. Tu recois un email de confirmation.
    3. Sur n'importe quel composant Pro, clique sur "Acheter" et utilise la MEME adresse email.
    4. Notre systeme reconnaît que tu es abonne et t'envoie le fichier gratuitement.

    Utilise toujours la meme adresse email que celle avec laquelle tu as souscrit.`
  },
  {
    id: "formats",
    emoji: "📦",
    title: "Format des fichiers",
    body: `Tous les composants sont livres dans un fichier .ZIP contenant :
    - Le code source (React, Next.js, HTML/CSS selon le composant)
    - Un fichier README.md avec les instructions d'installation
    - Les assets necessaires (images, fonts, etc.)

    La plupart des composants sont concus pour React/Next.js avec Tailwind CSS.`
  },
  {
    id: "contact",
    emoji: "📧",
    title: "Support & Contact",
    body: `Une question ? Un probleme avec un telechargement ?

    Email : achbelneri@gmail.com
    Reponse sous 24h en moyenne.

    En cas de lien expire, contacte-nous avec ton recu de paiement et on te regenere un lien.`
  }
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("comment-ca-marche");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSidebarClick = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className={sharedStyles.main}>
      <div className={styles.hero}>
        <div className={styles.badge}>DOCUMENTATION</div>
        <h1 className={styles.title}>Guide d&apos;utilisation</h1>
        <p className={styles.subtitle}>Tout ce que tu dois savoir pour utiliser Re-Use.</p>
      </div>

      <div className={styles.container}>
        {/* Sidebar */}
        <nav className={styles.sidebar}>
          {sections.map((s) => (
            <button
              key={s.id}
              className={`${styles.sidebarLink} ${activeSection === s.id ? styles.sidebarLinkActive : ""}`}
              onClick={() => handleSidebarClick(s.id)}
            >
              <span>{s.emoji}</span>
              <span>{s.title}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className={styles.content}>
          {sections.map((s) => (
            <section key={s.id} id={s.id} className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionEmoji}>{s.emoji}</span>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
              </div>
              <div className={styles.sectionBody}>
                {s.body.split("\n").map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  const isNumbered = /^\d+\./.test(trimmed);
                  const isBullet = trimmed.startsWith("- ");
                  if (isNumbered || isBullet) {
                    return (
                      <div key={i} className={styles.listItem}>
                        <span className={styles.listDot}>{isNumbered ? trimmed.match(/^\d+/)?.[0] + "." : "→"}</span>
                        <span>{isNumbered ? trimmed.replace(/^\d+\.\s*/, "") : trimmed.replace(/^-\s*/, "")}</span>
                      </div>
                    );
                  }
                  return <p key={i} className={styles.para}>{trimmed}</p>;
                })}
                {s.id === "abonnement" && (
                  <Link href="/pricing" className={styles.proBtn}>
                    Souscrire maintenant →
                  </Link>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>

      <FooterSection />
    </main>
  );
}
