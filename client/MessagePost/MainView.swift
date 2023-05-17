//
//  MainView.swift
//  MessagePost
//
//  Created by Balint Dobozi on 2023. 05. 03..
//

import SwiftUI

struct MainView: View {
    @State private var LoginSuccess = false
    @StateObject var currentUser = User()
    
    var body: some View {
        NavigationStack {
            VStack {
                if(currentUser.userdata == nil) {
                    LoginView()
                } else {
                    ContentView(currentUser: currentUser)
                }
            }
        }
        .environmentObject(currentUser)
    }
    
    struct MainView_Previews: PreviewProvider {
        static var previews: some View {
            MainView()
        }
    }
}
