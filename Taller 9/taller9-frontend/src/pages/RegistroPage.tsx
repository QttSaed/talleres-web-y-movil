import { useState } from "react";
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonInputPasswordToggle,
  IonItem,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
  useIonToast
} from "@ionic/react";

import { registrarUsuario } from "../services/api";
import "./LoginPage.css";

const RegistroPage: React.FC = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);

  const router = useIonRouter();
  const [presentarToast] = useIonToast();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreUsuario.trim()) {
      presentarToast({
        message: "Por favor ingresa un nombre de usuario",
        color: "warning",
        duration: 3000,
        position: "bottom"
      });
      return;
    }

    if (clave.length < 8) {
      presentarToast({
        message: "La contraseña debe tener al menos 8 caracteres",
        color: "warning",
        duration: 3000,
        position: "bottom"
      });
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario(nombreUsuario.trim(), clave);
      presentarToast({
        message: "Usuario registrado exitosamente. Ahora puedes ingresar con tus credenciales.",
        color: "success",
        duration: 3500,
        position: "bottom"
      });
      router.push("/login", "root", "replace");
    } catch (err) {
      presentarToast({
        message: err instanceof Error ? err.message : String(err),
        color: "danger",
        duration: 3500,
        position: "bottom"
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Registrarse</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form className="login" onSubmit={manejarEnvio}>
          <h1>Crear cuenta</h1>
          <p>Ingresa un usuario y una contraseña (mínimo 8 caracteres) para registrarte en el sistema.</p>

          <IonList>
            <IonItem>
              <IonInput
                label="Usuario"
                labelPlacement="stacked"
                value={nombreUsuario}
                autocomplete="username"
                placeholder="Ingresa tu nombre de usuario"
                onIonInput={(e) => setNombreUsuario(e.detail.value ?? "")}
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="Contraseña"
                labelPlacement="stacked"
                type="password"
                value={clave}
                autocomplete="new-password"
                placeholder="Mínimo 8 caracteres"
                onIonInput={(e) => setClave(e.detail.value ?? "")}
              >
                <IonInputPasswordToggle slot="end" />
              </IonInput>
            </IonItem>
          </IonList>

          <IonButton type="submit" expand="block" disabled={cargando} style={{ marginTop: "16px" }}>
            {cargando ? "Registrando..." : "Registrarme"}
          </IonButton>

          <IonButton routerLink="/login" fill="clear" expand="block" style={{ marginTop: "8px" }}>
            ¿Ya tienes cuenta? Inicia sesión
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default RegistroPage;
