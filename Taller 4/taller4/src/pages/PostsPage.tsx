import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";

import "./PostsPage.css";

interface Publicacion {
  userId: number;
  id: number;
  title: string;
  body: string;
}

const PostsPage: React.FC = () => {
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [estaCargando, setEstaCargando] = useState<boolean>(false);
  const [mensajeError, setMensajeError] = useState<string>("");

  const consultarPublicaciones = async () => {
    setEstaCargando(true);
    setMensajeError("");

    try {
      const respuesta = await fetch("https://jsonplaceholder.typicode.com/posts");

      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      const datos: Publicacion[] = await respuesta.json();
      setPublicaciones(datos);
    } catch (err) {
      console.error("Fallo al obtener publicaciones:", err);
      setMensajeError("Ocurrió un error al cargar las publicaciones.");
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Taller 4: Ionic + React + APIs</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <div className="intro">
          <h1>Publicaciones</h1>
          <p>
            Presiona el botón para obtener información desde JSONPlaceholder.
          </p>

          <IonButton onClick={consultarPublicaciones} disabled={estaCargando}>
            {estaCargando ? "Cargando..." : "Cargar publicaciones"}
          </IonButton>
        </div>

        {estaCargando && (
          <div className="estado">
            <IonSpinner name="crescent" />
            <p>Cargando publicaciones...</p>
          </div>
        )}

        {mensajeError && (
          <IonText color="danger">
            <p>{mensajeError}</p>
          </IonText>
        )}

        <div className="posts-container">
          {publicaciones.map((post) => (
            <IonCard key={post.id}>
              <IonCardHeader>
                <IonCardSubtitle>Publicación #{post.id}</IonCardSubtitle>
                <IonCardTitle>{post.title}</IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <p>{post.body}</p>
              </IonCardContent>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default PostsPage;
