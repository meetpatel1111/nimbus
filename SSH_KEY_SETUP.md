# 🔑 SSH Key Setup Guide

Quick guide to add your existing `nimbus.pem` key to GitHub Secrets.

## 📋 Prerequisites

You have `nimbus.pem` file on your local machine.

## 🔐 Step 1: Get the Private Key Content

### On Windows:
```powershell
# Open PowerShell in the directory where nimbus.pem is located
Get-Content nimbus.pem | clip
```

### On Mac/Linux:
```bash
# Copy the key content to clipboard
cat nimbus.pem | pbcopy  # Mac
cat nimbus.pem | xclip -selection clipboard  # Linux

# Or just display it to copy manually
cat nimbus.pem
```

The content should look like:
```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

## 🔐 Step 2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret:

```
Name: SSH_PRIVATE_KEY
Value: [Paste the entire content of nimbus.pem including BEGIN and END lines]
```

5. Click **Add secret**

## ✅ Step 3: Verify AWS Key Pair Name

Make sure your AWS key pair is named **"nimbus"**:

1. Go to AWS Console → EC2 → Key Pairs
2. Check if you have a key pair named **"nimbus"**
3. If it's named differently, either:
   - **Option A**: Rename it in AWS (or create new one named "nimbus")
   - **Option B**: Update the Terraform variable in the workflow

### Option B: Use Different Key Name

If your key pair has a different name (e.g., "my-key"), update the workflow:

In `.github/workflows/deploy.yml`, find this line:
```yaml
-var="key_pair_name=nimbus" \
```

Change to:
```yaml
-var="key_pair_name=my-key" \
```

## 🚀 Step 4: Push and Deploy

```bash
git push origin main
```

Go to **Actions** tab and run the workflow!

## 🔍 Troubleshooting

### "Load key: invalid format"
- Make sure you copied the ENTIRE key including:
  - `-----BEGIN RSA PRIVATE KEY-----`
  - All the content
  - `-----END RSA PRIVATE KEY-----`
- No extra spaces or characters

### "Permission denied (publickey)"
- Verify the key pair name in AWS matches "nimbus"
- Check that SSH_PRIVATE_KEY secret is set correctly
- Ensure the key has proper permissions (should be 600)

### "Key pair 'nimbus' does not exist"
- Create the key pair in AWS EC2 console
- Or update the `key_pair_name` variable to match your existing key

## 📝 Summary

After setup, you'll have:
- ✅ `SSH_PRIVATE_KEY` secret in GitHub
- ✅ AWS key pair named "nimbus" (or custom name)
- ✅ Workflow uses your existing key
- ✅ No key generation needed

The workflow will now use your existing `nimbus.pem` key for all SSH connections! 🎉

---

**Security Note**: Never commit your `.pem` file to git! Always use GitHub Secrets.
