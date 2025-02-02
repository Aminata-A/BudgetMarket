# BudgetMarket


### **Description**
BudgetMarket est une application web de suivi de dépenses budgétaires conçue pour aider les utilisateurs à planifier et suivre leurs dépenses lors de leurs courses. L'application permet d'ajouter des produits à une liste de courses, de spécifier le prix et la quantité, de marquer les produits comme achetés et de consulter les achats par date.

### **Fonctionnalités**
- Authentification des utilisateurs (inscription et connexion)
- Sélection de la date pour planifier les achats
- Ajout de produits à une liste de courses avec nom, prix et quantité
- Marquage des produits comme achetés
- Consultation des achats par date

### **Technologies utilisées**
- **Front-end** : HTML5, CSS3, JavaScript, Bootstrap
- **Back-end** : Supabase 
- **Autres** : Git, Netlify, Sweetalert

### **Installation**

1. **Cloner le dépôt**

   git clone https://github.com/votre-utilisateur/budgetmarket.git
   cd budgetmarket

2. **Installer les dépendances**
   Si vous utilisez npm :

   npm install
   

3. **Configurer l'environnement**
   Créez un fichier `.env` à la racine du projet et ajoutez vos clés API Supabase/Firebase.

   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

4. **Démarrer l'application**

   npm run dev
   
   Ou utilisez un serveur local comme Live Server pour lancer `index.html`.

### **Utilisation**

1. **Inscription/Connexion**
   - Inscrivez-vous ou connectez-vous à l'application pour accéder à vos listes de courses.

2. **Ajouter un produit**
   - Sélectionnez une date.
   - Remplissez le formulaire avec le nom du produit, le prix et la quantité, puis ajoutez-le à la liste.

3. **Marquer comme acheté**
   - Cochez les produits que vous avez achetés pour les marquer comme tels.

4. **Consulter les achats par date**
   - Sélectionnez une date pour voir la liste des produits planifiés et achetés pour ce jour-là.

### **Déploiement**

L'application est déployée sur Netlify. Vous pouvez accéder à la version en ligne à l'adresse suivante :
[https://budgetmarket.netlify.app](https://budgetmarket.netlify.app)

### **Contribuer**

Les contributions sont les bienvenues ! Pour contribuer :

1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. **Commit** vos modifications (`git commit -m 'Ajout d'une nouvelle fonctionnalité'`)
4. **Push** à la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une **Pull Request**

### **Licence**

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

### **Auteurs**

- **Votre Nom** - Développeur principal - [votre-profil-github](https://github.com/votre-utilisateur)

### **Remerciements**

Merci à [Simplon](https://simplon.co) pour le support et les ressources pédagogiques.

