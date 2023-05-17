//
//  ContentView.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 02..
//

import SwiftUI

struct ContentView: View {
    @State private var presentAlert : Bool = false
    @State private var enteredText : String = ""
    @ObservedObject var currentUser : User

    var body: some View {
        VStack {
            Button("Send message") {
                presentAlert = true
            }
            .alert("MEssage", isPresented: $presentAlert, actions: {
                TextField("Enter your message here...", text: $enteredText)
                Button("Send") {
                    submitText();
                }
                Button("Cancel", role: .cancel, action: {})
            }, message: {
                Text("Please enter your message")
            })
        }
    }
    
    func submitText() {
        let message = Message(message: enteredText);
        message.sendText()
    }
    
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        @State var uu : User = User()
        ContentView(currentUser: uu)
    }
}
