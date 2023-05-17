//
//  Login.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import SwiftUI

struct LoginView: View {
    //@Binding var isLoginSuccessful : Bool
    @EnvironmentObject var user : User
    @State private var Username = ""
    @State private var Password = ""
    @State var showPassword: Bool = false
    var isSignInButtonDisabled: Bool {
        [Username, Password].contains(where: \.isEmpty)
    }
    var body: some View {
        VStack(alignment: .leading, spacing: 15) {
            Spacer()
            TextField("Username",
                      text: $Username ,
                      prompt: Text("Username").foregroundColor(.blue)
            )
            .padding(10)
            .overlay {
                RoundedRectangle(cornerRadius: 10)
                    .stroke(.blue, lineWidth: 2)
            }
            .padding(.horizontal)
            HStack {
                Group {
                    if showPassword {
                        TextField("Password",
                                  text: $Password,
                                  prompt: Text("Password").foregroundColor(.blue))
                        
                    } else {
                        SecureField("Password",
                                    text: $Password,
                                    prompt: Text("Password").foregroundColor(.blue))
                    }
                }
                .padding(10)
                .overlay {
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(.blue, lineWidth: 2)
                }
                Button {
                    showPassword.toggle()
                } label: {
                    Image(systemName: showPassword ? "eye.slash" : "eye")
                        .foregroundColor(.gray)
                }
            }
            .padding(.horizontal)
            Spacer()
            
            Button{
                check()
            } label: {
                Text("Sign In")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)
            }
            .frame(height: 50)
            .frame(maxWidth: .infinity)
            .background(isSignInButtonDisabled ?
                        LinearGradient(colors: [.gray], startPoint: .topLeading, endPoint: .bottomTrailing) :
                            LinearGradient(colors: [.blue, .yellow], startPoint: .topLeading, endPoint: .bottomTrailing))
            .cornerRadius(20)
            .disabled(isSignInButtonDisabled)
            .padding()
        }
    }
    
    func check()  {
        let c = Credentials(username: Username, password: Password)
        Task.init() {
            do {
                user.userdata = try await c.checkLoginResponse()
                print(user.userdata!.username)
                //isLoginSuccessful = true
                print("login success")
            } catch Credentials.LoginResponse.wrongPassword{
                //isLoginSuccessful = false
                print("pass szar")
            } catch Credentials.LoginResponse.userNotFound{
                //isLoginSuccessful = false
                print("user not found")
            }
        }
    }
}

struct Login_Previews: PreviewProvider {
    static var previews: some View {
        @State var l : Bool = false
        LoginView()
    }
}
