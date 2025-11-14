# ✅ Quick Setup Checklist

Before running the deployment, ensure all secrets are configured in GitHub.

## 🔐 Required GitHub Secrets

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

### 1. SSH_PRIVATE_KEY ⚠️ **MISSING - ADD THIS FIRST!**

**How to add:**

**Windows (PowerShell):**
```powershell
# Navigate to where nimbus.pem is located
cd path\to\your\key
Get-Content nimbus.pem
```

**Mac/Linux:**
```bash
cat /path/to/nimbus.pem
```

**Copy the ENTIRE output including:**
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
(all the lines)
...
-----END RSA PRIVATE KEY-----
```

**Then:**
1. Go to GitHub → Settings → Secrets → Actions
2. Click **New repository secret**
3. Name: `SSH_PRIVATE_KEY`
4. Value: **Paste the entire key content**
5. Click **Add secret**

### 2. AWS Credentials (for AWS deployment)

```
Name: AWS_ACCESS_KEY_ID
Value: Your AWS access key

Name: AWS_SECRET_ACCESS_KEY
Value: Your AWS secret key
```

### 3. Docker Hub (Optional - for image push)

```
Name: DOCKER_USERNAME
Value: Your Docker Hub username

Name: DOCKER_PASSWORD
Value: Your Docker Hub access token
```

### 4. Azure Credentials (Optional - for Azure deployment)

```
Name: AZURE_SUBSCRIPTION_ID
Value: Your subscription ID

Name: AZURE_CLIENT_ID
Value: Your client ID

Name: AZURE_CLIENT_SECRET
Value: Your client secret

Name: AZURE_TENANT_ID
Value: Your tenant ID
```

## ⚠️ Common Mistakes

### SSH_PRIVATE_KEY Issues:

❌ **Wrong:**
- Copying just the filename
- Copying asterisks (`***`)
- Missing BEGIN/END lines
- Extra spaces or newlines

✅ **Correct:**
- Copy the ENTIRE file content
- Include `-----BEGIN RSA PRIVATE KEY-----`
- Include all the encoded content
- Include `-----END RSA PRIVATE KEY-----`
- No extra characters

### Example of correct format:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAyourkeycontent...
(many lines of base64 encoded data)
...endofyourkey==
-----END RSA PRIVATE KEY-----
```

## 🔍 How to Verify Secrets Are Set

1. Go to GitHub → Settings → Secrets → Actions
2. You should see:
   - ✅ `SSH_PRIVATE_KEY` (Updated X minutes ago)
   - ✅ `AWS_ACCESS_KEY_ID` (Updated X minutes ago)
   - ✅ `AWS_SECRET_ACCESS_KEY` (Updated X minutes ago)
   - ✅ `DOCKER_USERNAME` (Optional)
   - ✅ `DOCKER_PASSWORD` (Optional)

## 🚀 After Adding Secrets

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Click **Re-run all jobs**
4. Watch it deploy successfully! 🎉

## 📝 Quick Reference

| Secret | Required For | Where to Get |
|--------|-------------|--------------|
| `SSH_PRIVATE_KEY` | ✅ All deployments | Your `nimbus.pem` file |
| `AWS_ACCESS_KEY_ID` | ✅ AWS deployment | AWS IAM Console |
| `AWS_SECRET_ACCESS_KEY` | ✅ AWS deployment | AWS IAM Console |
| `DOCKER_USERNAME` | Docker Hub push | Docker Hub account |
| `DOCKER_PASSWORD` | Docker Hub push | Docker Hub access token |
| `AZURE_*` | Azure deployment | Azure Portal |

## 🆘 Still Having Issues?

### Test your SSH key locally:
```bash
# Test if key works
ssh -i nimbus.pem ubuntu@<your-ec2-ip>
```

If this works, the key is valid. Just copy its content to GitHub Secrets.

### Verify key format:
```bash
# Should show "RSA PRIVATE KEY"
head -1 nimbus.pem

# Should show "END RSA PRIVATE KEY"
tail -1 nimbus.pem
```

---

**Once `SSH_PRIVATE_KEY` is added, re-run the workflow!** 🚀
