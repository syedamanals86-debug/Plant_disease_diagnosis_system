print("Plant Disease Diagnosis System")

print("1. Train Model")
print("2. Predict Disease")
print("3. Run App")

choice = input("Enter your choice: ")

if choice == "1":
    import os
    os.system("python src/train.py")

elif choice == "2":
    import os
    os.system("python src/predict.py")

elif choice == "3":
    import os
    os.system("python app/app.py")

else:
    print("Invalid choice")