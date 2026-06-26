# GitHub Setup & Collaboration Guide

This guide is for teammates joining the **Monsoon Hackathon** project. Follow these steps to set up your environment, clone the repository, and collaborate effectively.

---

## 1. Prerequisites
Before getting started, make sure you have the following installed on your machine:
- **Git**: [Download Git](https://git-scm.com/downloads) (Ensure it's added to your system PATH).
- **Node.js** (for frontend/backend development): [Download Node.js](https://nodejs.org/).
- **GitHub Account**: Make sure you have a GitHub account and have shared your username with the repository owner (`VishalH01`) to get write access.

---

## 2. Authentication Setup
To push changes to GitHub, you need to authenticate your local Git command line. You have two options:

### Option A: HTTPS with Personal Access Token (PAT) - Recommended for Beginners
1. Go to GitHub -> **Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Tokens (classic)**.
2. Click **Generate new token (classic)**.
3. Give it a name (e.g., `Hackathon CLI Token`), set an expiration, and check the `repo` scope.
4. Click **Generate token** and copy it immediately (you won't see it again).
5. When Git asks for your password during clone/push, paste this token instead of your account password.

### Option B: SSH Keys (Secure & Passwordless)
1. Generate an SSH key in your terminal/command prompt:
   ```bash
   ssh-keygen -t ed25519 -C "your.email@example.com"
   ```
   *Press Enter to accept defaults.*
2. Start the SSH agent and add your key:
   - **Windows (PowerShell as Admin)**:
     ```powershell
     Start-Service ssh-agent
     ssh-add $env:USERPROFILE\.ssh\id_ed25519
     ```
   - **macOS/Linux**:
     ```bash
     eval "$(ssh-agent -s)"
     ssh-add ~/.ssh/id_ed25519
     ```
3. Copy your public key:
   - **Windows**: `cat ~/.ssh/id_ed25519.pub | clip` (or open the file in Notepad and copy).
   - **macOS**: `pbcopy < ~/.ssh/id_ed25519.pub`
4. Go to GitHub -> **Settings** -> **SSH and GPG keys** -> **New SSH Key**, paste the key, and save.

---

## 3. Clone and Configure the Repository
Open your terminal, navigate to the folder where you want to keep the project, and run:

### Cloning via HTTPS
```bash
git clone https://github.com/VishalH01/Monsoon_Hackthon.git
cd Monsoon_Hackthon
```

### Cloning via SSH
```bash
git clone git@github.com:VishalH01/Monsoon_Hackthon.git
cd Monsoon_Hackthon
```

### Configure Git User Details
Set your Git identity for this repository so commits are correctly attributed to you:
```bash
git config user.name "Your Full Name"
git config user.email "your.email@example.com"
```

---

## 4. Collaborative Git Workflow
To keep the code clean and prevent conflicts, follow this workflow:

### Step 1: Create a Feature Branch
**Never commit directly to the `main` branch.** Always create a branch for the feature or fix you are working on.
```bash
# Pull the latest changes from main first
git checkout main
git pull origin main

# Create and switch to your feature branch
git checkout -b feature/your-feature-name
```
*Naming convention: `feature/short-desc`, `bugfix/short-desc`, or `docs/short-desc`*

### Step 2: Write Code and Commit
As you make progress, commit your changes with clear, descriptive messages:
```bash
# Check modified files
git status

# Add changes
git add .

# Commit changes
git commit -m "feat: add user login component"
```

### Step 3: Keep Your Branch Updated
Before pushing, ensure your branch is up-to-date with any changes your teammates might have merged into `main`:
```bash
# Fetch latest main changes
git checkout main
git pull origin main

# Merge main back into your feature branch
git checkout feature/your-feature-name
git merge main
```
*If there are any merge conflicts, resolve them, add the files, and run `git commit` to complete the merge.*

### Step 4: Push to GitHub & Open a Pull Request
Push your branch to GitHub to make it available for review:
```bash
git push -u origin feature/your-feature-name
```
Once pushed:
1. Go to the repository URL on GitHub.
2. Click **Compare & pull request** on the banner.
3. Describe what your changes do and request review from a teammate.
4. Once reviewed and approved, merge the PR into the target branch (e.g., `dev` or `main`).

---

## 5. Integrating and Testing Without Affecting `main`
To combine and test multiple people's changes together without publishing them to the stable `main` branch, use one of the following strategies:

### Strategy A: Use a Shared `dev` (Development) Branch (Highly Recommended)
Instead of merging feature branches directly into `main`, the team merges all new work into a shared `dev` branch first. This keeps `main` clean and production-ready at all times.

1. **One-Time Setup (Repository Owner)**:
   Create the `dev` branch and push it to GitHub:
   ```bash
   git checkout main
   git checkout -b dev
   git push -u origin dev
   ```
2. **Workflow for Teammates**:
   - Create your feature branch off `dev` (not `main`):
     ```bash
     git checkout dev
     git pull origin dev
     git checkout -b feature/your-feature-name
     ```
   - Push your branch and open a Pull Request (PR) on GitHub.
   - **Crucial**: Set the target branch of the PR to **`dev`** (instead of `main`).
3. **Local Testing & Integration**:
   - Once PRs are merged into `dev`, teammates pull `dev` to get the latest combined code:
     ```bash
     git checkout dev
     git pull origin dev
     ```
   - Everyone can run and test the complete integrated code locally.
4. **Publishing to `main`**:
   - At the end of a milestone or when `dev` is thoroughly tested and stable, open a PR from `dev` into `main` to publish the changes.

### Strategy B: Local Integration Testing (Peer-to-Peer)
If teammate **A** wants to test teammate **B**'s changes locally before either of them merges their branch to a shared branch:

1. **Get your teammate's branch locally**:
   ```bash
   git fetch origin
   git checkout feature/teammate-b-branch
   ```
2. **Merge their branch into your local branch to test integration**:
   ```bash
   git checkout feature/your-branch
   git merge feature/teammate-b-branch
   ```
3. **Test locally**: Run the application and verify that the combined features work together without conflicts.

### Strategy C: Enforce Rules on GitHub (Branch Protection)
To guarantee that no one accidentally publishes directly to `main`, set up GitHub Branch Protection:
1. Navigate to your repository on [GitHub](https://github.com/VishalH01/Monsoon_Hackthon).
2. Click on **Settings** (top tab) -> **Branches** (left sidebar).
3. Under **Branch protection rules**, click **Add branch protection rule**.
4. Set **Branch name pattern** to `main`.
5. Enable **Require a pull request before merging**. This blocks direct pushes (e.g., `git push origin main` will fail).
6. (Optional) Enable **Require approvals** if you want at least one team member to review the code before merging.
7. Click **Create** or **Save changes**.
